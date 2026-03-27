import { Injectable } from "@angular/core";
import { MessageCategory } from "@app/enums/MessageCategory";
import { MessageType } from "@app/enums/MessageType";
import {
    BinderRatingEngineOutput,
    CoverageRequest,
    CoverageType,
    Message,
    PricingInformation,
    Quote,
    Tag
} from "@app/models";
import { CommissionRate } from "@app/models/auto-generated/CommissionRate";
import { QuoteService } from "@app/quote/services/quote.service";
import { CombineDiscountPricingService } from "@app/services/combine-discount-pricing.service";
import { CoverageHttpService } from "@app/services/coverage-http.service";
import { MessageService } from "@app/services/message.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PricingHttpService } from "@app/services/pricing-http-service";
import { BehaviorSubject, Observable } from "rxjs";
import { first, flatMap, map } from "rxjs/operators";
import { DiscountInformation } from "@app/quote/models/pricing/DiscountInformation";
import { RateChangeInformation } from "@app/quote/models/pricing/RateChangeInformation";
import { FiledDiscountInformation } from "@app/quote/models/pricing/FiledDiscountInformation";
import { SuggestedDiscountInformation } from "../models/pricing/SuggestedDiscountInformation";
import { PricingResult } from "../models/pricing/PricingResult";

@Injectable({ providedIn: "root" })
export class PricingService {

    constructor(
        private readonly pricingHttpService: PricingHttpService,
        private readonly messageService: MessageService,
        private readonly coverageHttpService: CoverageHttpService,
        private readonly quoteService: QuoteService,
        private premiumCalculationsService: PremiumCalculationsService,
        private readonly combineDiscountPricingService: CombineDiscountPricingService
    ) {
    }

    public isCalculating: boolean = false;
    private _pricingInformationChanges = new BehaviorSubject<boolean>(null);
    public pricingInformationChanges = this._pricingInformationChanges.asObservable();
    private mapDiscountWithoutRoundingBusinessLines: Map<string, number> = new Map<string, number>();

    public setIsCalculating(isCalculating: boolean) {
        this.isCalculating = isCalculating;
    }

    public updateBusinessLines(): void {
        const quote = this.quoteService.getQuote();
        this.isCalculating = true;
        this.getPricingInformation(quote).subscribe(
            pricingResult => {

                const combinedPricing = this.combineDiscountPricingService.combineNewPricingWithDiscounts(quote.pricingInformation, pricingResult.pricingInformations);
                this.quoteService.setPropertyValue("pricingInformation", combinedPricing);

                this.premiumCalculationsService.calculateTotalFee(quote).pipe(first())
                    .subscribe((quoteResult) => {
                        this.quoteService.setPropertyValue("commissionInformation", (quoteResult as Quote).commissionInformation);
                        this.premiumCalculationsService.updatePremium();
                        this.quoteService.setPropertyValue("needsPricingRecalculation", false);
                        this._pricingInformationChanges.next(true);
                    },
                        (err) => console.error(err),
                        () => { this.isCalculating = false; });
            },
            err => console.error(err)
        );
    }

    public updateProRatedPricingInformationWithFullFee(originalPricing: PricingInformation[], proRatedPricing: PricingInformation[]) {
        const pricingInformation = originalPricing.map(line => {
            const fee = line.fee;
            const proRatedLine = proRatedPricing.find(proRatedLine => proRatedLine.businessLine.name === line.businessLine.name);
            return { ...proRatedLine, fee };
        });
        // TODO perform calc on quote location premiums

        // New location outputs to be passed into here

        this.quoteService.setPropertyValue("pricingInformation", pricingInformation);
    }

    public getProRatedPricingInformation(quote: Quote, newInceptionDate: Date, newExpiryDate: Date): Observable<PricingResult> {
        const quoteCopy: Quote = JSON.parse(JSON.stringify(quote));
        quoteCopy.inceptionDate = newInceptionDate;
        quoteCopy.expiryDate = newExpiryDate;

        return this.getPricingInformation(quoteCopy, true).pipe(map(pricingResult => {
            return {
                pricingInformations: this.combineDiscountPricingService.combineNewPricingWithDiscounts(quote.pricingInformation, pricingResult.pricingInformations),
                locationOutputs: pricingResult.locationOutputs
            };
        }));
    }

    public getPricingInformation(quote: Quote, hasAgreedPremium: boolean = false): Observable<PricingResult> {
        const request: CoverageRequest = {
            product: quote.product.productName,
            territory: quote.insuredLocation.country.isoCode,
            wordingVersionId: quote.wordingVersionId
        };

        return this.coverageHttpService
            .getAvailable(request)
            .pipe(
                flatMap(coverages =>
                    this.getBinderRatingForQuote(quote, hasAgreedPremium)
                        .pipe(
                            map(ratingOutputs =>
                                this.parseBinderRatingEngineOutputs(ratingOutputs, quote, coverages)),
                            first())),
                first());
    }

    public getBrokerCommissionRate(brokerTeamId: number, productId: number): Observable<CommissionRate> {
        return this.pricingHttpService.getCommissionRate(brokerTeamId, productId);
    }

    private getBinderRatingForQuote(quote: Quote, hasAgreedPremium = false): Observable<BinderRatingEngineOutput[]> {
        if (quote.quoteReference && quote.quoteReference !== 0) {
            return this.pricingHttpService.getDefaultPricingInformationForSavedQuote(quote, hasAgreedPremium);
        } else {
            return this.pricingHttpService.getDefaultPricingInformation(quote.draftQuoteId);
        }
    }

    public getBusinessLines(quote: Quote, withAdditionalCoverages: boolean = false) {
        const coverages = withAdditionalCoverages
            ? quote.coverages
            : quote.coverages.filter(x => !x.coverageType.isAdditionalCoverage);

        const businessLines: Tag[] = [];

        coverages
            .filter(x => x.coverageType.businessLine)
            .forEach(coverage => businessLines.push(coverage.coverageType.businessLine));

        return businessLines.filter((x, index) => businessLines.findIndex(y => y.name === x.name) === index);
    }

    private parseBinderRatingEngineOutputs(binderRatingOutputs: BinderRatingEngineOutput[], quote: Quote, coverages: CoverageType[]): PricingResult {
        const result: PricingInformation[] = [];
        const errorList: string[] = [];

        binderRatingOutputs.forEach(output => this.parseBinderRatingEngineOutput(output, errorList, result));

        if (Object.keys(quote.binderValidationCriteria).length === 0) {
            errorList.push("No binders were found, please check the inception date.");
        }

        this.sendErrorMessages(errorList);

        if (errorList.length > 0) {
            quote.isApproved = false;
        }

        const pricingPropertyFieldNames = ["discount", "rateChangePercentage", "filedDiscount", "suggestedDiscount", "suggestedDiscountPercentage"];

        result.forEach(p => {

            pricingPropertyFieldNames.forEach(propertyName => {
                p[propertyName] = this.setDefaultValue(p.businessLine.name, quote, p[propertyName], propertyName);
            });
        });

        const pricingInformations = this.populateBusinessLineDescription(result, coverages);
        const locationOutputs = binderRatingOutputs.filter(bro => !!bro.locationOutputs && bro.locationOutputs.length > 0).map(x => x.locationOutputs).reduce((acc, val) => acc.concat(val), []);

        return { pricingInformations, locationOutputs };
    }

    private setDefaultValue(businessLine: string, quote: Quote, defaultValue: number, propertyKey: string): number {
        var pricingInformation = quote.pricingInformation.find(pi => pi.businessLine.name === businessLine);
        return pricingInformation ? pricingInformation[propertyKey] : defaultValue;
    }

    private parseBinderRatingEngineOutput(output: BinderRatingEngineOutput, errorList: string[], result: PricingInformation[]) {
        if (output.internalError) {
            let desc = "";
            if (output.binder) {
                desc = output.binder.binderDescription;
            }
            errorList.push(`Error retrieving prices for binder: ${desc}`);
        }
        if (output.ratingEngineMessage) {
            errorList.push(output.ratingEngineMessage);
        }

        if (output.pricingInformation) {
            output.pricingInformation.forEach(pricingInformation => {
                pricingInformation.binder = output.binder;
                pricingInformation.fee = this.roundCurrency(pricingInformation.defaultFeePercentage * pricingInformation.quoted / 100);
                result.push(pricingInformation);
            });
        } else {
            errorList.push("Unexpected rating outputs.");
        }
    }

    private populateBusinessLineDescription(pricingInformation: PricingInformation[], coverages: CoverageType[]): PricingInformation[] {
        return pricingInformation
            .filter(x => x.businessLine)
            .map(x => this.getDefaultPricingInformation(x, this.getBusinessLineDescription(x.businessLine.name, coverages)));
    }

    private sendErrorMessages(errorList: string[]) {
        this.messageService.clearMessage();
        this.messageService.clearMessage(MessageCategory.RatingEngine);

        if (errorList.length === 0) return;

        const msg = new Message();
        msg.type = MessageType.Error;
        if (errorList.length === 1) {
            msg.text = errorList[0];
        } else if (errorList.length > 1) {
            msg.messageList = errorList;
        }

        this.messageService.sendMessage(msg);
        this.messageService.sendMessage(msg, MessageCategory.RatingEngine);
    }

    private getBusinessLineDescription(businessLine: string, coverages: CoverageType[]): string {
        const businessLines = coverages
            .filter(x => x.businessLine != null)
            .filter(x => x.businessLine.name === businessLine)
            .map(x => x.businessLine);

        if (businessLines.length > 0) {
            return businessLines[0].description;
        } else {
            return null;
        }
    }

    private getDefaultPricingInformation(pricingInformation: PricingInformation, description: string): PricingInformation {

        if (!pricingInformation.model || pricingInformation.model === 0) {
            pricingInformation.discount = 0;
        }

        pricingInformation.fee = Math.round(pricingInformation.defaultFeePercentage *
            pricingInformation.quoted) / 100;

        pricingInformation.businessLine.description = description;

        return pricingInformation;
    }

    private roundCurrency(input: number): number {
        return Math.round(input * 100) / 100;
    }

    /* discount calculation */

    private roundToDecimals(value: number, scale: number = 2) {
        if (scale <= 0) {
            return Math.round(value);
        }
        const factor = Math.pow(10, scale);
        return Math.round(value * factor) / factor;
    }

    public calculateQuotedPremiumFromDiscount(discountInformation: DiscountInformation): number {
        const discountValueWithoutRounding = this.mapDiscountWithoutRoundingBusinessLines.get(discountInformation.businessLine.name);
        if (discountValueWithoutRounding !== undefined && this.roundToDecimals(discountValueWithoutRounding) === discountInformation.discount) {
            discountInformation.discount = discountValueWithoutRounding;
        }
        return this.roundToDecimals(discountInformation.model - discountInformation.discount * discountInformation.model / 100);
    }

    public calculateDiscountFromQuotedPremium(discountInformation: DiscountInformation, updateMap: boolean = false): number {
        const value = (discountInformation.model - discountInformation.quotedPremium) / discountInformation.model * 100;
        if (updateMap) this.mapDiscountWithoutRoundingBusinessLines.set(discountInformation.businessLine.name, value);
        return this.roundToDecimals(value);
    }

    /* ratechange calculation */

    public calculateQuotedPremiumFromRateChangePercentage(rateChangeInformation: RateChangeInformation): number {
        const expiringQuotedRatePremiumRatio = rateChangeInformation.expiringQuotedPremium / rateChangeInformation.expiringRateChangePremium;
        return this.roundToDecimals(((rateChangeInformation.rateChangePercentage / 100 + 1) * (expiringQuotedRatePremiumRatio) * rateChangeInformation.currentRateChangePremium));
    }

    public calculateRateChangePercentageFromQuotedPremium(rateChangeInformation: RateChangeInformation): number {
        const expiringQuotedRatePremiumRatio = rateChangeInformation.expiringQuotedPremium / rateChangeInformation.expiringRateChangePremium;
        return this.roundToDecimals((((rateChangeInformation.quotedPremium / rateChangeInformation.currentRateChangePremium) / expiringQuotedRatePremiumRatio) - 1) * 100, 3);
    }

    /* calculate filedDiscount */

    public calculateFiledDiscountFromQuotedPremium(filedDiscountInformation: FiledDiscountInformation): number {
        return this.roundToDecimals((filedDiscountInformation.filedPremium - filedDiscountInformation.quotedPremium) / filedDiscountInformation.filedPremium * 100);
    }

    public calculateQuotedPremiumFromFiledDiscount(filedDiscountInformation: FiledDiscountInformation): number {
        return this.roundToDecimals(filedDiscountInformation.filedPremium - filedDiscountInformation.filedPremium * filedDiscountInformation.filedDiscount / 100);
    }

    /* calculate suggestedDiscountPercentage */

    public calculateSuggestedDiscountPercentageFromQuotedPremium(suggestedDiscountPercentageInformation: SuggestedDiscountInformation): number {
        return this.roundToDecimals((suggestedDiscountPercentageInformation.suggested - suggestedDiscountPercentageInformation.quotedPremium) / suggestedDiscountPercentageInformation.suggested * 100);
    }

    public calculateQuotedPremiumFromSuggestedDiscountPercentage(suggestedDiscountPercentageInformation: SuggestedDiscountInformation): number {
        return this.roundToDecimals(suggestedDiscountPercentageInformation.suggested - suggestedDiscountPercentageInformation.suggested * suggestedDiscountPercentageInformation.suggestedDiscountPercentage / 100);
    }
}
