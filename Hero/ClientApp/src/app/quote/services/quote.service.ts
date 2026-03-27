import { PropertyLimit } from '@app/quote/models/property-limit.model';
import { Injectable } from "@angular/core";
import { ActivityDetail, Currency, PricingInformation, Quote, QuoteState, RiskQuestionAnswer } from "@app/models";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { cloneDeep, isEqual, round, stubFalse } from "lodash";
import { BehaviorSubject, Observable } from "rxjs";
import { distinctUntilChanged, map, tap } from "rxjs/operators";
import { QuoteAction } from "../models/QuoteAction";
import { LocationOutput } from "../models/pricing/LocationOutput";
import { CoverageService } from "@app/services/coverage.service";
import { PolicyLocationPremiums } from "../models/pricing/PolicyLocationPremiums";
import { UserService } from '@app/services/user.service';

@Injectable()
export class QuoteService {
    // Quote referece objects
    // Obsolete - will be in here for a while until we migrate everything to use the quote state and related methods
    private _quote: Quote;
    private _originalQuote: Quote;
    private _hasBlastZoneCapacity: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // Quote - we do not change directly the quote object
    // we keep quoteState private and provide public methods to change it
    // next step (once we remove completely the VM object) would be move this
    // logic to a Quote Store providing actions / reducers to handle changes
    private _quoteState: BehaviorSubject<Quote> = new BehaviorSubject(null);
    private _propertyChanged: BehaviorSubject<QuoteAction> = new BehaviorSubject(null);
    public quote = this._quoteState.asObservable();
    public propertyChanged$ = this._propertyChanged.asObservable();

    constructor(
        private readonly currencyService: CurrencyHttpService,
        private coverageService: CoverageService,
        private userService: UserService) { }

    // update a whole quote
    public updateQuote(quote: Quote, isOriginalQuote: boolean) {
        this._quote = quote;
        this._quoteState.next(Object.assign({}, quote));
        this._propertyChanged.next({ type: "quote", payload: this.getQuoteReference() });
        if (isOriginalQuote) {
            this._originalQuote = Object.assign({}, quote);
        }
    }

    // update a given property in the quote
    public setPropertyValue(propertyName: string, propertyValue: any) {
        const newQuoteValue = this.getQuoteReference();
        newQuoteValue[propertyName] = propertyValue;

        this._quote = newQuoteValue;
        this._quoteState.next(cloneDeep(newQuoteValue));
        this._propertyChanged.next({ type: propertyName, payload: cloneDeep(propertyValue) });
    }

    public getQuoteProperty$ = (project: (value: Quote) => any): Observable<any> => {
        return this.quote.pipe(map(project), distinctUntilChanged(isEqual));
    }

    // returns the current quote state - it won't include changes made directly to this._quote / the VM object
    public getQuote() {
        return Object.assign({}, this._quoteState.getValue());
    }

    public getQuoteReference() {
        return this._quote;
    }

    public getOriginalQuote() {
        return this._originalQuote;
    }

    public getActivities(): ActivityDetail[] {
        return this._quote.activities ? this._quote.activities : [];
    }

    public getClient() {
        return this._quote.client ? this._quote.client : null;
    }

    public getWordingVersionId(): number | null {
        return this._quote?.wordingVersionId ?? null;
    }

    public getCurrency(): Currency {
        if (this._quote.currency && !this._quote.currency.rate) {
            this.currencyService.getCurrencyRateByIsoCode(this._quote.currency.isoCode).subscribe((currencyRate) => {
                this._quote.currency.rate = currencyRate;
            });
        }

        return this._quote.currency;
    }

    public getRiskQuestionAnswers(): RiskQuestionAnswer[] {
        return this._quote.riskQuestionAnswers ? this._quote.riskQuestionAnswers : [];
    }

    public isSaved(): boolean {
        return this._quote?.quoteReference > 0 ? true : false;
    }

    public isUpdating(): boolean {
        return this._quote?.state === QuoteState.InProgress ? true : false;
    }

    public hasPropertyLimits(): boolean {
        return this._quote?.propertyLimits?.length > 0 ? true : false;
    }

    public hasQuoteLocationPremiums(): boolean {
        return this._quote?.propertyLimits?.some((pl) => pl.quoteLocationPremiums?.length > 0) ? true : false;
    }

    public isMultipleProperties(): boolean {
        return this.userService.isFeatureAccessible('multipleProperties') && !!this.coverageService.getMultiplePropertiesBusinessLine(); // Todo: Check later
    }

    public mapLocationPremiumsToPropertyLimits(locationOutputs: LocationOutput[]) {
        const newQuoteValue = this.getQuoteReference();

        locationOutputs.forEach((locationOutput) => {
            const propertyLimit = newQuoteValue.propertyLimits?.find((pl) => pl.ratingReference === locationOutput.id);
            const multiplePropertiesBusinessLine = this.coverageService.getMultiplePropertiesBusinessLine();
            if (!!propertyLimit) {
                propertyLimit.quoteLocationPremiums = [];
                propertyLimit.quoteLocationPremiums.push({
                    modelPremium: locationOutput.modelPremium,
                    suggestedPremium: locationOutput.suggestedPremium,
                    quotedPremium: locationOutput.suggestedPremium,
                    businessLineCode: multiplePropertiesBusinessLine
                });
            }
        });

        this._quoteState.next(cloneDeep(newQuoteValue));
    }

    public applyModelDiscountToLocationPremiums() {

        const pricing = this.getMultiplePropertiesPricingInformation(this._quote.pricingInformation);

        const modelDiscountPercentage = pricing.quoted / pricing.model;

        this.proportionQuoteLocationModelPremiums(modelDiscountPercentage);

        this.roundQuoteLocationQuotedPremiums(pricing.quoted);
    }

    public roundQuoteLocationQuotedPremiums(intendedTotal: number) {
        const newQuoteValue = this.getQuoteReference();

        const propertyLimitsWithPremiums = newQuoteValue.propertyLimits.filter((pl) => pl.quoteLocationPremiums?.length > 0);

        const totalQuoted = propertyLimitsWithPremiums.map((pl) => pl.quoteLocationPremiums.map((qlp) => qlp.quotedPremium).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
        const difference = intendedTotal - totalQuoted;

        if (difference === 0) {
            return
        };

        const quoteLocationPremiums = propertyLimitsWithPremiums.map((pl) => pl.quoteLocationPremiums).reduce((a, b) => a.concat(b), []);
        const target = quoteLocationPremiums.sort((a, b) => b.quotedPremium - a.quotedPremium)[0];
        target.quotedPremium = this.roundToTwoDecimals(target.quotedPremium + difference);

        this.updateQuote(newQuoteValue, false);
    }

    public calculatePolicyLocationPremiums(newPricingInformationList: PricingInformation[], newLocationOutputs: LocationOutput[] = null): PolicyLocationPremiums[] {
        var policyLocationPremiums: PolicyLocationPremiums[] = [];
        var sumQuoteLocationQuotedPremium = 0;

        this._quote.propertyLimits.forEach((propertyLimit: PropertyLimit) => {
            const locationOutput = newLocationOutputs?.find((location) => location.id === propertyLimit.ratingReference);
            propertyLimit.quoteLocationPremiums?.forEach((quoteLocationPremium) => {
                this.coverageService.setMultiplePropertiesBusinessLine(quoteLocationPremium.businessLineCode);
                policyLocationPremiums.push({
                    propertyLimitId: propertyLimit.propertyLimitId,
                    businessLineCode: quoteLocationPremium.businessLineCode,
                    modelPremium: locationOutput?.modelPremium ?? quoteLocationPremium.modelPremium,
                    suggestedPremium: locationOutput?.suggestedPremium ?? quoteLocationPremium.suggestedPremium,
                    quotedPremium: quoteLocationPremium.quotedPremium
                });
                sumQuoteLocationQuotedPremium += quoteLocationPremium.quotedPremium;
            });
        });

        const pricing = this.getMultiplePropertiesPricingInformation(newPricingInformationList);
        const modelDiscountPercentage = pricing.quoted / sumQuoteLocationQuotedPremium;

        policyLocationPremiums.forEach((policyLocationPremium) => {
            policyLocationPremium.quotedPremium = this.roundToTwoDecimals(policyLocationPremium.quotedPremium * modelDiscountPercentage);
        });

        this.roundPolicyLocationQuotedPremiums(policyLocationPremiums, pricing.quoted);

        return policyLocationPremiums;
    }

    private roundPolicyLocationQuotedPremiums(policyLocationPremiums: PolicyLocationPremiums[], intendedTotal: number) {
        const totalPolicyQuotedPremium = policyLocationPremiums.map((plp) => plp.quotedPremium).reduce((a, b) => a + b, 0);
        const difference = intendedTotal - totalPolicyQuotedPremium;

        if (difference === 0) {
            return
        };

        const target = [...policyLocationPremiums].sort((a, b) => b.quotedPremium - a.quotedPremium)[0];
        target.quotedPremium = this.roundToTwoDecimals(target.quotedPremium + difference);
        policyLocationPremiums.find((plp) => plp.propertyLimitId === target.propertyLimitId && plp.businessLineCode === target.businessLineCode)
            .quotedPremium = target.quotedPremium;
    }

    private getMultiplePropertiesPricingInformation(pricingInformationList: PricingInformation[]): PricingInformation {
        return pricingInformationList.find((pricingInformation) => pricingInformation.businessLine.name === this.coverageService.getMultiplePropertiesBusinessLine());
    }

    private proportionQuoteLocationModelPremiums(multiplier: number) {
        const newQuoteValue = this.getQuoteReference();

        newQuoteValue.propertyLimits.filter((pl) => pl.quoteLocationPremiums?.length > 0).forEach((propertyLimit) => {
            propertyLimit.quoteLocationPremiums.forEach((quoteLocationPremium) => {
                quoteLocationPremium.quotedPremium = this.roundToTwoDecimals(quoteLocationPremium.modelPremium * multiplier);
            });
        });

        this.updateQuote(newQuoteValue, false);
    }

    private roundToTwoDecimals(value: number): number {
        return Math.round(value * 100) / 100;
    }

    public getHasBlastZoneCapacity(): BehaviorSubject<boolean> {
        return this._hasBlastZoneCapacity;
    }

    public setHasBlastZoneCapacity(hasCapacity: boolean) {
        this._hasBlastZoneCapacity.next(hasCapacity);
    }
}
