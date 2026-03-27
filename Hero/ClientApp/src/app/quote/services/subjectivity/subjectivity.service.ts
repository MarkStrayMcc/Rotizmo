import { Injectable } from "@angular/core";
import { BrokerTeam, ClientLocation, Quote, QuoteSubjectivity, Subjectivity } from "@app/models";
import { SubjectivityFilterParameters } from "@app/quote/models/subjectivity/SubjectivityFilterParameters";
import { Observable } from "rxjs";
import { SubjectivityHttpService } from "./subjectivity-http.service";
import { SearchSubjectivitiesQuery } from "@app/quote/models/subjectivity/subjectivity-configuration/SearchSubjectivitiesQuery";
import { SearchSubjectivitiesResult } from "@app/models/subjectivity-configuration/SearchSubjectivitiesResult";
import { LanguageService } from "@app/quote/services/language.service";
import { CountryService } from "@app/quote/services/country.service";
import { RiskQuestionAnswer } from "@app/quote/models/subjectivity/subjectivity-configuration/RiskQuestionAnswer";
import { DatePipe } from "@angular/common";
import { isCanada, isCanadianBroker } from "@app/helpers";

@Injectable()
export class SubjectivityService {
    private approvedSubjectivities: Subjectivity[];
    private availableSubjectivities: Subjectivity[];

    constructor(private subjectivityHttpService: SubjectivityHttpService,
        private languageService: LanguageService,
        private countryService: CountryService,
        private datePipe: DatePipe) {
    }

    public getMainData(productId: number, languageId: number, countryId: number, isAdmitted: boolean, surplusBrokerId?: number): Observable<Subjectivity[] | any> {
        return this.subjectivityHttpService.getMainData(productId, languageId, countryId, isAdmitted, surplusBrokerId);
    }

    public getDefaultSubjectivities(draftQuoteId: string): Observable<Subjectivity[] | any> {
        return this.subjectivityHttpService.getDefaultSubjectivities(draftQuoteId);
    }

    public search(subjectivityFilterParameters: SubjectivityFilterParameters): Observable<Subjectivity[] | any> {
        return this.subjectivityHttpService.search(subjectivityFilterParameters);
    }

    public searchInSubjectivityConfiguration(quote: Quote): Observable<SearchSubjectivitiesResult[] | any> {
        let searchSubjectivitiesQuery = this.getSubjectivityQueryFromQuote(quote);
        return this.subjectivityHttpService.searchInSubjectivityConfiguration(searchSubjectivitiesQuery);
    }

    public getAvailableSubjectivities() {
        return this.availableSubjectivities;
    }

    public setAvailableSubjectivities(availableSubjectivities: Subjectivity[]) {
        return this.availableSubjectivities = availableSubjectivities;
    }

    public getApprovedSubjectivities() {
        return this.approvedSubjectivities;
    }

    public setApprovedSubjectivities(approvedSubjectivities: Subjectivity[]) {
        return this.approvedSubjectivities = approvedSubjectivities;
    }

    public getSubjectivityQueryFromQuote(quote: Quote): SearchSubjectivitiesQuery {
        let language = this.languageService.getLanguageById(quote.languageId);

        return {
            LanguageIsoCode: language ? language.isoCode : null,
            HasLocalBroker: quote.surplusLineBroker !== null || quote.localBroker !== null || this.hasBrokerInInsuredLocation(quote),
            InceptionDate: this.getFormattedDate(quote.inceptionDate),
            ProductCode: quote.product.productName,
            CountryIsoCode: quote.clientLocation.country.isoCode,
            StateIsoCode: (quote.clientLocation.stateProvinceCode?.length >= 2) ? quote.clientLocation.stateProvinceCode : null,
            BusinessLines: quote.coverages.map(coverage => coverage.coverageType.businessLine.name),
            RiskQuestionAnswers: this.getRiskQuestionAnswers(quote)
        };
    }

    public formatSubjectivityDisplayText(subjectivity: QuoteSubjectivity): string {
        const postPriorToText = subjectivity.isPost ? `${subjectivity.days} days after` : "prior to";
        let subjectivityText = "";
        if (subjectivity.subjectivity && subjectivity.subjectivity.text) {
            subjectivityText = subjectivity.subjectivity.text;
        } else if (subjectivity.text) {
            subjectivityText = subjectivity.text;
        }
        return `${subjectivityText} (${postPriorToText} binding)`;
    }

    public static readonly validationMessages = {
        subjectivity: {
            required: "Subjectivity must either be selected or entered",
            unique: "Subjectivity text must be unique for all subjectivities"
        },
        postprior: {
            required: "Select one"
        },
        days: {
            required: "Required",
            over0: "Must be more than zero",
            integers: "Only whole numbers allowed"
        }
    }

    private hasBrokerInInsuredLocation(quote: Quote): boolean {
        return isCanada(quote.insuredLocation) && isCanadianBroker(quote.brokerTeam) ||
            this.isEea(quote.insuredLocation) && this.isEeaBroker(quote.brokerTeam);
    }

    private isEea(address: ClientLocation): boolean {
        return address && address.country && this.countryService.isEeaCountry(address.country.isoCode);
    }

    private isEeaBroker(brokerTeam: BrokerTeam): boolean {
        return brokerTeam &&
            brokerTeam.broker &&
            brokerTeam.broker.country &&
            this.countryService.isEeaCountry(brokerTeam.broker.country.isoCode);
    }

    private getRiskQuestionAnswers(quote: Quote): RiskQuestionAnswer[] {
        return quote.riskQuestionAnswers.map(riskQuestionAnswer => {
            let answer = riskQuestionAnswer.answer;
            if (answer === null || answer === undefined) {
                answer = "";
            }

            return {
                tag: riskQuestionAnswer.riskQuestionTag,
                answer: answer
            }
        });
    }

    private getFormattedDate(date: Date): string {
        if (date) {
            return this.datePipe.transform(date, 'yyyy-MM-dd');
        }

        return null;
    }

    public static readonly priorBindDefaultSubjectivities: (number | string)[] = [11, 23, 7297, 131465, 240000, 240001, 246002, 246003, 250000, 274025, 395503]; // "Temporary" until we move default subjectivity logic to DB
    public static readonly incidentResponseAppSubjectivityId: number = 279437;
    public static readonly incidentResponseAppSubjectivityDays = 30;
}
