import { Injectable, OnDestroy } from "@angular/core";
import { Quote, QuoteStep } from "@app/models";
import { GoodsAndServicesTaxResponse } from "@app/quote/models/pricing/GoodsAndServicesTaxResponse";
import { QuoteService } from "@app/quote/services/quote.service";
import { BehaviorSubject, Observable, Subject, throwError } from "rxjs";
import { catchError, first, takeUntil } from "rxjs/operators";
import { RiskService } from "../../services/risk-service";
import { TaxHttpService } from "../../services/tax-http.service";
import { UserService } from "../../services/user.service";

@Injectable({ providedIn: "root" })
export class GoodsAndServicesTaxService implements OnDestroy {
    constructor(
        private taxHttpService: TaxHttpService,
        private riskService: RiskService,
        private userService: UserService,
        private quoteService: QuoteService) {
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe.next();
        this._ngUnsubscribe.complete();
    }

    private _ngUnsubscribe = new Subject<void>();
    private _gstRate = new BehaviorSubject<number>(null);
    private _inceptionDate: Date;
    private _countryIsoCode: string;
    private _isRegistered: boolean;
    private _isGstVisible = new BehaviorSubject<boolean>(false);

    public isGstVisible = this._isGstVisible.asObservable();
    public gstRate = this._gstRate.asObservable();

    public updateGSTRate(inceptionDate: Date): Observable<number> {
        let result;
        if (this.userService.isFeatureAccessible("heroNewZealandGst")) {
            const quote = this.quoteService.getQuoteReference()
            var isGstRegistered = this.isGstRegistered();

            if (this.isValidGoodsAndServicesTaxRequest(isGstRegistered) &&
                this.hasGstRelatedDataChanged(isGstRegistered)
            ) {
                this.saveCurrentGstRequiredDataState(isGstRegistered);
                result = this.taxHttpService.getGoodsAndServicesTax(quote.inceptionDate, quote.insuredLocation.country.isoCode, isGstRegistered);
                result.pipe(catchError((response: Response | any) => {
                    if (response.status === 404) {
                        this._isGstVisible.next(false);
                    }
                    return throwError(response);
                })).subscribe((goodsAndServicesTaxResponse: GoodsAndServicesTaxResponse) => {
                    this._gstRate.next(goodsAndServicesTaxResponse.rate);
                    this._isGstVisible.next(true);
                });
            }
        } else {
            result = this.taxHttpService.getGSTRate(inceptionDate);
            result.pipe(first())
                .subscribe(
                    gstRate => this._gstRate.next(gstRate),
                    error => console.error(error));
        }
        return result;
    }

    public isGstAvailable() {
        return this._isGstVisible.getValue();
    }

    public isGSTRateAvailable() {
        return this._gstRate.getValue() != null;
    }

    public getGST(): number {
        return this._gstRate.getValue();
    }

    public useGST(quote: Quote): boolean {
        if (this.userService.isFeatureAccessible("heroNewZealandGst")) {
            return !this.isGstRegistered();
        } else {
            return !this.isRevenueOverLimit(quote) && !this.isGstRegistered();
        }
    }

    private isRevenueOverLimit(quote: Quote): boolean {
        if (!quote.riskQuestionAnswers) {
            return false;
        }

        const totalRevenueRiskQuestionAnswer = quote.riskQuestionAnswers.find(x => x.riskQuestionTag === "TOTAL_REVENUE");

        return totalRevenueRiskQuestionAnswer && totalRevenueRiskQuestionAnswer.currency >= 75000;
    }

    public isGstRegistered(): boolean {
        let quoteRiskQuestionAnswers = this.quoteService.getRiskQuestionAnswers();

        if (!quoteRiskQuestionAnswers) {
            return false;
        }

        const gstRegisteredRiskAnswer = quoteRiskQuestionAnswers.find(x => x.riskQuestionTag === "GST_Registered");

        const gstYesriskQuestionOptionUid = this.getGstYesriskQuestionOptionUid();

        return !gstRegisteredRiskAnswer || gstRegisteredRiskAnswer.riskQuestionOptionUid === gstYesriskQuestionOptionUid;
    }

    public gstUpdateHandler() {
        this.quoteService.propertyChanged$.pipe(takeUntil(this._ngUnsubscribe)).subscribe(changes => {
            if (this.isGstProperty(changes.type)) {
                let quote = this.quoteService.getQuoteReference();
                this.updateGSTRate(quote.inceptionDate);
            }
        });
    }

    private isGstProperty(property: string) {
        const gstProperties = ["quote", "insuredLocation", "inceptionDate"];
        const hasGstProperties = gstProperties.includes(property);
        const hasGstRegisteredQuestion = property === "riskQuestionAnswers" &&
            this.quoteService.getQuoteReference().riskQuestionAnswers.findIndex(riskAnswer => riskAnswer.riskQuestionTag === "GST_Registered") >= 0;
        return hasGstProperties || hasGstRegisteredQuestion;
    }

    private getGstYesriskQuestionOptionUid(): string {
        const riskQuestions = this.riskService.getRiskQuestions(QuoteStep.Risk);

        if (!riskQuestions) {
            return null;
        }

        const gstRegisteredRiskQuestion = riskQuestions.find(rq => rq.tag === "GST_Registered");

        if (!gstRegisteredRiskQuestion) {
            return null;
        }

        const gstYesRiskSelectOption = gstRegisteredRiskQuestion.options.find(x => x.text === "Yes");

        if (!gstYesRiskSelectOption) {
            return null;
        }

        return gstYesRiskSelectOption.uid;
    }

    private saveCurrentGstRequiredDataState(isGstRegistered: boolean) {
        let quote = this.quoteService.getQuoteReference();

        this._inceptionDate = quote.inceptionDate;
        this._countryIsoCode = quote.insuredLocation.country.isoCode;
        this._isRegistered = isGstRegistered;
    }

    private isValidGoodsAndServicesTaxRequest(isRegistered: boolean) {
        let quote = this.quoteService.getQuoteReference();

        if (!quote) {
            return false;
        }

        if (!quote.inceptionDate) {
            return false;
        }

        if (!quote.insuredLocation || !quote.insuredLocation.country || !quote.insuredLocation.country.isoCode) {
            return false;
        }

        if (!quote.riskQuestionAnswers || quote.riskQuestionAnswers.length === 0) {
            return false;
        }

        if (isRegistered === null) {
            return false;
        }

        return true;
    }

    private hasGstRelatedDataChanged(isRegistered: boolean) {
        let quote = this.quoteService.getQuoteReference();

        if (this._inceptionDate !== quote.inceptionDate) {
            return true;
        }

        if (quote.insuredLocation.country && this._countryIsoCode !== quote.insuredLocation.country.isoCode) {
            return true;
        }

        if (this._isRegistered !== isRegistered) {
            return true;
        }

        return false;
    }
}
