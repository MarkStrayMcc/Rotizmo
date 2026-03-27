import { DecimalPipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { BinderValidationCriteria, CoverageType, Quote, QuoteState, RiskQuestionType, Tag } from "@app/models";
import { QuoteConfig } from "../quote/quote.config";
import { BinderValidationHttpService } from "./binder-validation-http.service";
import { PricingService } from "../quote/services/pricing-service";
import { first } from "rxjs/operators";

@Injectable()
export class BinderValidationService {

    private draftQuoteId: string;

    private criterias: { [businessCategoryTagName: string]: BinderValidationCriteria[] } = {};

    private criteriasForSelectedBusinessCategories: { [businessCategoryTagName: string]: BinderValidationCriteria[] } = {};

    private businessLines: Tag[];

    private readonly terrorismProductId: number = 23;
    private readonly terrorismAvoidedBinderSectionIds: number[] = [1290, 1395, 1396, 1398, 1399, 1404, 1405];

    private bindersValidationWarningMessages: {
        [businessCategoryTagName: string]:
        { [tabCode: string]: { [warningCode: number]: string } }
    } = {};

    public warningsCode = {
        Coverages: { NoBinderValidation: 0, MaxLimit: 1 },
        Risk: { MaxRevenue: 0, MaxUsExposure: 1, MinUsExposure: 2 },
        Pricing: { SomeValue: 0 }
    };

    constructor(protected binderValidationHttpService: BinderValidationHttpService,
                protected pricingService: PricingService,
                protected numberPipe: DecimalPipe
    ) {
    }

    public loadBinderValidationCriterias(draftQuoteId: string, businessLineCodes: string, productId?: number) {
        this.binderValidationHttpService.getBinderValidationCriterias(draftQuoteId, businessLineCodes)
            .pipe(first())
            .subscribe(criterias => {
                this.draftQuoteId = draftQuoteId;
                if (productId === this.terrorismProductId && criterias['TR']?.length > 1) {
                    criterias['TR'] = criterias['TR'].filter(c => !this.terrorismAvoidedBinderSectionIds.includes(c.binderSectionId));
                }
                this.criterias = criterias;
            },
                error => {
                    console.error(JSON.stringify(error));
                });
    }

    public get binderValidationCriterias(): {
        [businessCategoryTagName: string]: BinderValidationCriteria[]
    } {
        return this.criterias;
    }

    public getFirstBinderSectionIdByBusinessLineCode(businessLineCode: string): number {
        const criteria = this.criterias?.[businessLineCode];
        if (criteria && criteria.length > 0) {
            return criteria[0].binderSectionId;
        }

        return null;
    }

    public getTerrorismBinderSectionId(): number {
        return this.getFirstBinderSectionIdByBusinessLineCode("TR");
    }

    public loadCriteriasForSelectedBusinessCategories(quote: Quote) {
        this.criteriasForSelectedBusinessCategories = {};
        if (!quote.binderValidationCriteria) {
            quote.binderValidationCriteria = {};
        }
        this.businessLines = this.pricingService.getBusinessLines(quote, true);

        for (const key in this.criterias) {
            if (this.criterias.hasOwnProperty(key) &&
                this.businessLines.some(businessLine => businessLine.name === key)) {
                this.criteriasForSelectedBusinessCategories[key] = this.criterias[key];
            }
        }
    }

    public loadCriteriasForSelectedBusinessCategoriesOnQuote(quote: Quote) {
        this.criteriasForSelectedBusinessCategories = {};
        if (!quote.binderValidationCriteria) {
            quote.binderValidationCriteria = {};
            return;
        }

        for (const key in quote.binderValidationCriteria) {
            if (quote.binderValidationCriteria.hasOwnProperty(key) && quote.binderValidationCriteria[key]) {
                this.criteriasForSelectedBusinessCategories[key] = [];
                this.criteriasForSelectedBusinessCategories[key].push(quote.binderValidationCriteria[key]);
            }
        }
    }

    public get selectedBusinessCategoriesCriterias(): {
        [businessCategoryTagName: string]: BinderValidationCriteria[]
    } {
        return this.criteriasForSelectedBusinessCategories;
    }

    public getBusinessLineCodes(newCoverageTypes: CoverageType[]) {
        return newCoverageTypes
            .filter(coverageType => coverageType.businessLine)
            .map(x => x.businessLine.name)
            .join(",");
    }

    public sortBindersCriteria(binderCriterias: { [businessCategoryTagName: string]: BinderValidationCriteria[] },
                               sortBy: (p1: BinderValidationCriteria, p2: BinderValidationCriteria) => number) {

        for (const key in binderCriterias) {
            if (binderCriterias[key].length > 0) {
                binderCriterias[key].sort(sortBy);
            }
        }
    }

    public get bindersCriteriaValidationWarningMessages() {
        return this.bindersValidationWarningMessages;
    }

    // Risk tab validation functionality

    public filterBindersCriteriaBasedOnRevenueFirst(quote: Quote): void {
        let n: number;
        let foundValidCriteria: boolean;
        const allBindersCriteria = this.selectedBusinessCategoriesCriterias;

        if (!quote.binderValidationCriteria) {
            quote.binderValidationCriteria = {};
        }

        this.sortBindersCriteria(
            allBindersCriteria,
            this.sortByMaxRevenue);

        const filteredBindersCriteria = {};

        this.resetWarningMessages("Risk");
        // this needs to be removed when coverages will be implemented
        this.resetWarningMessages("Coverages");

        for (const key in allBindersCriteria) {
            if (allBindersCriteria.hasOwnProperty(key)) {
                this.bindersValidationWarningMessages[key] = {};
                this.bindersValidationWarningMessages[key].Risk = {};
                this.bindersValidationWarningMessages[key].Coverages = {};

                foundValidCriteria = false;
                n = allBindersCriteria[key].length;
                // we have at least one binder section
                if (n > 0) {
                    filteredBindersCriteria[key] = new Array<BinderValidationCriteria>();

                    for (let i = n - 1; i > -1; i--) {

                        if (allBindersCriteria[key][i].maxRevenue === null) {
                            filteredBindersCriteria[key].push(allBindersCriteria[key][i]);
                            foundValidCriteria = true;
                        }

                        const revenue = this.getRiskAnswerNumber(quote, "TOTAL_REVENUE", RiskQuestionType.currency);
                        if (allBindersCriteria[key][i].maxRevenue >= revenue) {
                            filteredBindersCriteria[key].push(allBindersCriteria[key][i]);
                            foundValidCriteria = true;
                        }

                    }

                    if (!foundValidCriteria) {
                        filteredBindersCriteria[key].push(allBindersCriteria[key][n - 1]);
                    }
                }
                // TODO when we do the story for coverages binder validation
                // else {
                //    if (!this.bindersValidationWarningMessages[key].Coverages) {
                //        this.bindersValidationWarningMessages[key].Coverages = {};
                //    }

                //    this.bindersValidationWarningMessages[key]
                //        .Coverages[this.warningsCode.Coverages.NoBinderValidation] =
                //        `No binder section available for the ${key}`;
                // }
            }
        }

        this.checkUsExposure(filteredBindersCriteria, quote);
    }

    public initialiseBindersCriteriaValidation(quote: Quote): void {
        if (!quote.binderValidationCriteria) {
            quote.binderValidationCriteria = {};
        }

        if (quote.state !== QuoteState.InProgress) {
            this.loadCriteriasForSelectedBusinessCategoriesOnQuote(quote);
        } else {
            this.loadCriteriasForSelectedBusinessCategories(quote);
        }

        this.filterBindersCriteriaBasedOnRevenueFirst(quote);
    }

    private resetWarningMessages(stepName: string) {
        const messages = this.bindersValidationWarningMessages;

        if (stepName) {
            for (const businessCategory in messages) {
                if (messages[businessCategory] && messages[businessCategory][stepName]) {
                    messages[businessCategory][stepName] = {};
                }
            }
        }
    }

    private checkUsExposure(
        filteredBindersCriteria: { [businessCategoryTagName: string]: BinderValidationCriteria[] },
        quote: Quote): void {

        const revenueRate = this.getRiskAnswerNumber(quote, "US_PERCENT", RiskQuestionType.percentage) / 100;

        // order binder sections criteria based on the USMinExposure
        this.sortBindersCriteria(
            filteredBindersCriteria,
            this.sortByUsMaxExposure);

        this.sortBindersCriteria(
            filteredBindersCriteria,
            this.sortByUsMinExposure);

        for (const key in filteredBindersCriteria) {
            if (filteredBindersCriteria.hasOwnProperty(key)) {
                let index: number = 0;
                const revenueLastYear = this.getRiskAnswerNumber(quote, "TOTAL_REVENUE", RiskQuestionType.currency);
                if (filteredBindersCriteria[key].length > 0) {
                    index = this.checkBinderCriteriaForUsExposure(key,
                        filteredBindersCriteria[key],
                        revenueRate,
                        revenueLastYear && revenueLastYear !== 0);
                }

                quote.binderValidationCriteria[key] = filteredBindersCriteria[key][index];
            }
        }
    }

    public checkBinderCriteriaForUsExposure(
        key: string,
        bindersCriterias: BinderValidationCriteria[],
        revenueRate: number,
        canSetWarnings: boolean): number {
        const n = bindersCriterias.length;
        let index = -1;
        let firstIndex = -1;

        while ((index < n - 1) && revenueRate >= bindersCriterias[index + 1].usMinExposure) {
            index++;

            if (firstIndex === -1 && bindersCriterias[index].usMaxExposure >= revenueRate) {
                firstIndex = index;
            }

            if (bindersCriterias[index].usMaxExposure >= revenueRate &&
                (firstIndex === -1 ||
                (firstIndex > -1 &&
                    bindersCriterias[index].usMinExposure !== bindersCriterias[firstIndex].usMinExposure))
            ) {
                firstIndex = index;
            }
        }

        index = (firstIndex !== -1) ? firstIndex : index;

        while (index > 0 && revenueRate > bindersCriterias[index].usMaxExposure) {
            index--;
        }

        if (index < 0) {
            index = 0;
        }

        if (revenueRate > bindersCriterias[index].usMaxExposure) {
            let max = bindersCriterias[index].usMaxExposure;

            for (let x = index; x < n && revenueRate > bindersCriterias[x].usMaxExposure; x++) {
                if (bindersCriterias[x].usMaxExposure > max) {
                    max = bindersCriterias[x].usMaxExposure;
                    index = x;
                }
            }
        }

        return index;
    }

    private sortByUsMinExposure(p1: BinderValidationCriteria, p2: BinderValidationCriteria): number {
        if (p1.usMinExposure > p2.usMinExposure) {
            return 1;
        }
        if (p1.usMinExposure < p2.usMinExposure) {
            return -1;
        }
        return 0;
    }

    private sortByMaxRevenue(p1: BinderValidationCriteria, p2: BinderValidationCriteria): number {
        if (p1.maxRevenue > p2.maxRevenue) {
            return 1;
        }
        if (p1.maxRevenue < p2.maxRevenue) {
            return -1;
        }
        return 0;
    }

    private sortByUsMaxExposure(p1: BinderValidationCriteria, p2: BinderValidationCriteria): number {
        if (p1.usMaxExposure > p2.usMaxExposure) {
            return 1;
        }
        if (p1.usMaxExposure < p2.usMaxExposure) {
            return -1;
        }
        return 0;
    }

    // End Risk tab validation functionality

    // get binder warning messages on tab or
    public getBinderValidationWarningMessages(): boolean {

        const validationMessages = this.bindersCriteriaValidationWarningMessages;
        let businessCategoryMessages;

        for (const businessCategoryKey in validationMessages) {
            if (validationMessages.hasOwnProperty(businessCategoryKey)) {
                businessCategoryMessages = validationMessages[businessCategoryKey];
                if (businessCategoryMessages) {
                    for (const tabKey in businessCategoryMessages) {
                        if (businessCategoryMessages[tabKey]) {
                            for (const errorKey in businessCategoryMessages[tabKey]) {
                                if (businessCategoryMessages[tabKey][errorKey]) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    public areBinderSectionsForAllBC(): boolean {
        const i = 0;
        for (const key in this.bindersCriteriaValidationWarningMessages) {
            if (this.bindersCriteriaValidationWarningMessages[key] && this.bindersCriteriaValidationWarningMessages[key].Coverages) {
                if (this.bindersCriteriaValidationWarningMessages[key].Coverages[this.warningsCode.Coverages
                    .NoBinderValidation]) {

                    return false;
                }
            }
        }
        return true;
    }

    public getBinderValidationWarningForTab(stepComp: number, businessCategory?: string): string[] {
        const stepName = QuoteConfig.StepName[stepComp];
        const messages = [];

        if (businessCategory) {
            this.getBinderValidationWarningForBusinessCategory(businessCategory, stepName, messages);
        } else {
            for (const key in this.selectedBusinessCategoriesCriterias) {
                if (this.selectedBusinessCategoriesCriterias.hasOwnProperty(key)) {
                    this.getBinderValidationWarningForBusinessCategory(key, stepName, messages);
                }
            }
        }

        return messages;
    }

    public generateBinderValidationWarningsForTab(stepComp: number, quote: Quote) {
        switch (stepComp) {
            case QuoteConfig.StepNr.Risk:
                {
                    this.filterBindersCriteriaBasedOnRevenueFirst(quote);
                    break;
                }
            // to add the other steps which can have warnings errors
        }
    }

    private getBinderValidationWarningForBusinessCategory(businessCategory: string, stepName: string, messages: string[]) {
        let stepWarningsCode = {};
        let buisnessCategoryWarnings = {};

        if (businessCategory && this.bindersCriteriaValidationWarningMessages.hasOwnProperty(businessCategory)) {

            buisnessCategoryWarnings = this.bindersCriteriaValidationWarningMessages[businessCategory];

            if (this.warningsCode.hasOwnProperty(stepName)) {

                stepWarningsCode = this.warningsCode[stepName];

                for (const x in stepWarningsCode) {

                    if (buisnessCategoryWarnings[stepName] &&
                        buisnessCategoryWarnings[stepName][stepWarningsCode[x]]) {

                        messages.push(
                            buisnessCategoryWarnings[stepName][stepWarningsCode[x]]);
                    }

                }
            }
        }

        return messages;
    }

    // end general warning messages

    private getRiskAnswerNumber(quote: Quote, tag: string, questionType: RiskQuestionType): number {
        const answer = quote.riskQuestionAnswers ? quote.riskQuestionAnswers.find(i => i.riskQuestionTag === tag) : null;

        if (answer) {
            switch (questionType) {
                case RiskQuestionType.currency:
                    return answer.currency;
                case RiskQuestionType.percentage:
                    return answer.percentage;
                default:
                    return answer.number;
            }
        }
        return null;
    }
}
