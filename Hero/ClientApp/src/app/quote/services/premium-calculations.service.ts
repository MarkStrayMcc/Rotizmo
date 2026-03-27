import { Injectable } from "@angular/core";
import { isAustralia, isNewZealand } from "@app/helpers";
import { PricingInformation, Quote, QuoteBindRequest } from "@app/models";
import { ModelMappingsHelper } from "@app/models/Mappings/ModelMappingsHelper";
import { FeeResponse } from "@app/quote/models/Fees/FeeResponse";
import { QuoteService } from "@app/quote/services/quote.service";
import { FeeHttpService } from "@app/services/fee-http.service";
import { TriaService } from "@app/services/tria.service";
import { UserService } from "@app/services/user.service";
import { of, Subject, zip } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { GoodsAndServicesTaxService } from "./goods-and-services-tax.service";

@Injectable({ providedIn: "root" })
export class PremiumCalculationsService {
    public constructor(
        private feeHttpService: FeeHttpService,
        private goodsAndServicesTaxService: GoodsAndServicesTaxService,
        private triaService: TriaService,
        private userService: UserService,
        private quoteService: QuoteService) {
    }

    public feeCalculationError = new Subject<string>();

    public premiumUpdateHandler() {
        this.goodsAndServicesTaxService.gstRate.subscribe(gstRate => {
            this.updatePremium(gstRate);
        });
    }

    public updatePremium(gstRate?: number) {
        const quote = this.quoteService.getQuote();

        if (quote) {
            const quotedPremiumMinusCommission = this.getCalculatedQuotePremium(quote);
            this.quoteService.setPropertyValue("premium", quotedPremiumMinusCommission);

            const quoteFee = quote.commissionInformation ? quote.commissionInformation.fee : 0;

            this.triaService.updateTriaPremium();

            const gstRate = this.goodsAndServicesTaxService.isGSTRateAvailable() ? this.goodsAndServicesTaxService.getGST() : 0;

            if (this.goodsAndServicesTaxService.useGST(quote)) {
                quote.gst = this.roundCurrency(gstRate * quotedPremiumMinusCommission);
            } else {
                quote.gst = 0;
            }
            quote.totalDue = quotedPremiumMinusCommission + quoteFee + quote.gst;

            if (this.shouldAddTaxToTheTotal(quote)) {
                const tax = this.roundCurrency(quotedPremiumMinusCommission * quote.taxRate);
                quote.totalDue += tax;
            }

            this.quoteService.setPropertyValue("gst", quote.gst);
            this.quoteService.setPropertyValue("totalDue", quote.totalDue);
        }
    }

    private shouldAddTaxToTheTotal(quote: Quote) {
        const isHeroNewZealandGstFeatureEnabled = this.userService.isFeatureAccessible("heroNewZealandGst");
        const isAdmitted = quote.product && quote.product.isAdmitted;

        if (this.countryIsAustralia(quote)) {
            return false;
        }

        if (isHeroNewZealandGstFeatureEnabled && this.countryIsNewZealand(quote)) {
            return false;
        }

        if (isAdmitted) {
            return false;
        }

        return true;
    }

    public calculateTotalFee(quote: Quote) {
        const useExcelCalculator = this.userService.isFeatureAccessible("excelFeeCalculation");
        if (!!quote.commissionInformation && !!quote.pricingInformation && quote.pricingInformation.length > 0) {
            if (useExcelCalculator) {
                return this.calculateFeeWithExcelCalculator(quote);
            }
            return this.calculateFeeWithoutExcelCalculator(quote);
        } else {
            return of<Quote>(quote);
        }
    }

    private getCalculatedQuotePremium(quote: Quote | QuoteBindRequest): number {
        if (quote) {
            if (quote.pricingInformation) {
                quote.premium = quote.pricingInformation
                    .map(details => details.quoted)
                    .reduce((quoted, total: number) => quoted + total, 0);
            } else {
                quote.premium = 0;
            }
            return quote.premium;
        }
        return 0;
    }

    private calculateFeeWithExcelCalculator(quote: Quote) {
        const feeRequest = ModelMappingsHelper.getFeeRequest(quote);
        const fee$ = this.feeHttpService.getFee(feeRequest);
        const quoteCopy = Object.assign({}, quote);

        return fee$
            .pipe(map((fee: FeeResponse) => {
                this.updateCommissionInformationFeeWithExcelCalculator(fee.totalFee, quoteCopy);
                if (fee.errorMessage) {
                    this.feeCalculationError.next(fee.errorMessage);
                }
                return quoteCopy;
            }),
                catchError((err) => {
                    const errorMessage = "An unexpected fee calculation error has occurred. Please contact IT.";

                    this.feeCalculationError.next(errorMessage);
                    return of({ errorMessage: errorMessage });
                }));
    }

    //This will be removed once the Excel Fee Calculator is switched on for all users.
    private calculateFeeWithoutExcelCalculator(quote: Quote) {
        const fee = quote.pricingInformation
            .map(details => this.calculateFee(details))
            .reduce((fee, total: number) => fee + total, 0);

        this.quoteService.setPropertyValue("commissionInformation", { ...quote.commissionInformation, fee });

        const maxFeeRequest = ModelMappingsHelper.getQuoteFeeRequest(quote);

        const defaultFeeRequest = ModelMappingsHelper.getQuoteFeeRequest(quote);
        defaultFeeRequest.premium = this.getCalculatedQuotePremium(quote);

        const maxFee$ = this.feeHttpService.getMaximumFee(maxFeeRequest);
        const defaultFee$ = this.feeHttpService.getDefaultFee(defaultFeeRequest);

        const quoteCopy = Object.assign({}, quote);
        const observable = zip(defaultFee$, maxFee$);
        return observable
            .pipe(map((items: [number, number]) => {
                this.updateCommissionInformationFeeWithoutExcelCalculator(items[0], items[1], quoteCopy);
                return quoteCopy;
            }));
    }

    public updateCommissionInformationFeeWithExcelCalculator(totalFee: number, quote: Quote) {
        if (totalFee != null) {
            quote.commissionInformation.fee = totalFee;
        }
    }

    public updateCommissionInformationFeeWithoutExcelCalculator(totalFee: number, maxFee: number, quote: Quote) {
        if (totalFee != null) {
            quote.commissionInformation.fee = totalFee;
            this.calculateFeeSplit(quote);
        }
        if (quote.commissionInformation.fee > maxFee) {
            quote.commissionInformation.fee = maxFee;
            this.calculateFeeSplit(quote);
        }
    }

    public calculateFeeSplit(quote: Quote | QuoteBindRequest) {
        if (!!quote.pricingInformation && quote.pricingInformation.length > 0) {
            const totalDefaultFee = quote.pricingInformation
                .map(details => this.roundCurrency(details.quoted * details.defaultFeePercentage * 100))
                .reduce((defaultFee, total: number) => defaultFee + total, 0);

            quote.pricingInformation.forEach(details =>
                details.fee = totalDefaultFee === 0 ? 0 : this.roundCurrency(
                    (quote.commissionInformation.fee * (details.quoted * details.defaultFeePercentage) / totalDefaultFee * 100)));
            this.distributeRoundingErrors(quote);
        }
    }

    private countryIsAustralia(quote: Quote): boolean {
        return quote && isAustralia(quote.insuredLocation);
    }

    private countryIsNewZealand(quote: Quote): boolean {
        return quote && isNewZealand(quote.insuredLocation);
    }

    private calculateFee(pricingInformation: PricingInformation): number {
        pricingInformation.fee = this.roundCurrency(pricingInformation.quoted * pricingInformation.defaultFeePercentage / 100);
        return pricingInformation.fee;
    }

    private distributeRoundingErrors(quote: Quote | QuoteBindRequest) {
        const totalFee = quote.pricingInformation
            .map(details => details.fee)
            .reduce((fee, total: number) => fee + total, 0);

        const under = quote.commissionInformation.fee > totalFee;

        let index = 0;
        let difference = this.roundCurrency(quote.commissionInformation.fee - totalFee);

        if (!under) {
            difference = -difference;
        }

        while (difference > 0) {
            quote.pricingInformation[index].fee =
                this.roundCurrency(quote.pricingInformation[index].fee + (under ? 0.01 : -0.01));
            difference -= 0.01;
            index = (index + 1) % quote.pricingInformation.length;
        }
    }

    private roundCurrency(input: number): number {
        return Math.round(input * 100) / 100;
    }
}
