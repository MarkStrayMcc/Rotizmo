import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { IStepNavigation } from "@app/interfaces/step-navigation";
import { Payment, Quote, QuoteBindRequest, QuoteBindResponse, QuoteSubjectivity, RiskQuestionAnswer, SurplusLine } from "@app/models";
import { BindQuoteBasicStepComponent } from "@app/quote/popups/bind-quote-modal/bind-quote-basic-step/bind-quote-basic-step.component";
import { bindQuoteBasicValidator } from "@app/quote/popups/bind-quote-modal/bind-quote-basic-step/bind-quote-basic.validator";
import { BordereauHttpService } from "@app/quote/services/bordereau-http.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { PricingService } from "@app/quote/services/pricing-service";
import { QuoteHttpService } from "@app/services/quote-http.service";
import { UserService } from "@app/services/user.service";
import { ConfirmationModalComponent } from "@app/shared/modals/confirmation-modal/confirmation-modal.component";
import { ConfirmationModalConfig } from "@app/shared/modals/confirmation-modal/confirmation-modal.config";
import { AutocompleteValidator } from "@app/validators/autocomplete-selected.validator";
import * as moment from "moment";
import { Observable, of, Subject } from "rxjs";
import { catchError, first, takeUntil, tap } from "rxjs/operators";
import { DirectBillingService } from "./bind-quote-pricing-step/direct-billing.service";
import { TransactionBillingHttpService } from "./transaction-billing.http-service";
import { PaymentMethod } from "@app/enums/PaymentMethod";
import { PaymentService } from "./bind-quote-pricing-step/payment.service";
import { LocationOutput } from "@app/quote/models/pricing/LocationOutput";
import { QuoteService } from "@app/quote/services/quote.service";
import { BlastZoneHttpService } from "@app/services/blast-zone-http.service";
import { PropertyLimitBlastZoneCapacityRequest } from "@app/models/property-limit-blast-zone-capacity-request";
import { ToastType, ToastrService } from "@app/shared/toastr/toastr.service";
import { getLimitValue, sumFloatingValues } from '@app/helpers/limit-helper';
import { PropertyLimitConfig } from '@app/quote/models/PropertyLimitConfig';
import { LimitBasis } from '@app/enums/LimitBasis';

@Component({
    selector: "bind-quote-modal",
    templateUrl: "./bind-quote-modal.component.html",
    styleUrls: ["./bind-quote-modal.component.scss"],
})
export class BindQuoteModalComponent implements OnInit, IStepNavigation, OnDestroy {
    @Input() public quote: Quote;

    public readonly steps: { [name: string]: number } = { basic: 0, subjectivities: 1, pricing: 2 };
    public currentStep = 0;
    public bindQuoteForm: FormGroup;
    public bordereauClosedDate: Date = new Date();
    public subjectivities: QuoteSubjectivity[] = [];
    public isBinding: boolean = false;
    public isCalculating: boolean = false;

    private _isDirectBillingEnabled: boolean = false;
    private _paymentPeriod: string;
    private ngUnsubscribe: Subject<any> = new Subject();
    private receivedDate: moment.Moment;
    private readonly deleteSubjectivityRules: { match: () => boolean; id: string }[] = [
        { match: () => !!this.ABN, id: "131245" /* ABN */ },
        { match: () => !!this.ABN, id: "6a5a6a63-4aee-450d-8072-3ab5d06f2d80" /* ABN */ },
        { match: () => !!this.surplusLinesBroker, id: "23" /* SL */ },
        { match: () => !!this.surplusLinesBroker, id: "6b7e36d4-5364-4762-9341-657d7336f4f8" /* SL */ },
        { match: () => !!this.bindQuoteForm.value.basic.localBroker, id: "246002" /* EEA */ },
        { match: () => !!this.bindQuoteForm.value.basic.localBroker, id: "c54b3ea3-f78d-428c-99a6-c8756a268265" /* EEA */ },
    ];
    private locationOutputs: LocationOutput[] = [];

    @ViewChild("basicStepComponent")
    public basicStepComponent: BindQuoteBasicStepComponent;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly dialogRef: MatDialogRef<BindQuoteModalComponent>,
        private readonly quoteHttpService: QuoteHttpService,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly pricingService: PricingService,
        private readonly userService: UserService,
        private readonly bordereauHttpService: BordereauHttpService,
        private readonly transactionBillingHttpService: TransactionBillingHttpService,
        private readonly modalDialogService: ModalDialogService,
        private readonly directBillingService: DirectBillingService,
        private readonly paymentService: PaymentService,
        private readonly quoteService: QuoteService,
        private readonly blastZoneHttpService: BlastZoneHttpService,
        private readonly _toastrService: ToastrService
    ) { }

    public ngOnInit() {
        this.subjectivities = this.quote.subjectivities.map((s) => Object.assign({}, s));
        this.bindQuoteForm = this.createFormGroup();
        this.subscribeFormChanges();
        this.watchDirectBillingChanges();
        this.watchPaymentPeriodChanges();
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public ngAfterViewInit() {
        this.changeDetector.detectChanges();
    }

    public onCloseModal(response?: QuoteBindResponse) {
        this.dialogRef.close(response);
    }

    public onSubjectivityChange(subjectivities: QuoteSubjectivity[]) {
        this.subjectivities = subjectivities;
    }

    public setStep(stepNumber: number) {
        if (this.isValidStepNumber(stepNumber) && this.isEnabled(stepNumber)) {
            if (stepNumber > this.currentStep && this.getCurrentFormGroup().invalid) {
                this.getCurrentFormGroup().markAsTouched();
                Object.keys(this.getCurrentFormGroup().controls)
                    .map((key) => this.getCurrentFormGroup().controls[key])
                    .forEach((control) => {
                        control.markAsTouched();
                    });

                return;
            }

            if (this.currentStep === 0 && stepNumber === 1) {
                for (const rule of this.deleteSubjectivityRules) {
                    if (!!rule.match()) {
                        this.deleteSubjectivity(rule.id);
                    }
                }

                this.recalculatePremiums();
            }

            this.currentStep = stepNumber;
        }
    }

    private isValidStepNumber(stepNumber: number): boolean {
        return stepNumber >= 0 && stepNumber < Object.keys(this.steps).length;
    }

    private watchDirectBillingChanges() {
        this.directBillingService
            .getIsDirectBillingEnabled()
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((isDirectBillingEnabled) => (this._isDirectBillingEnabled = isDirectBillingEnabled))
            )
            .subscribe();
    }

    private watchPaymentPeriodChanges() {
        this.paymentService
            .getPaymentPeriod()
            .pipe(
                takeUntil(this.ngUnsubscribe),
                tap((paymentPeriod) => (this._paymentPeriod = paymentPeriod))
            )
            .subscribe();
    }

    private deleteSubjectivity(id: string) {

        let index: number;
        if (this.subjectivities.some(subjectivity => subjectivity.subjectivity === null)) {
            index = this.subjectivities.findIndex((s) => s.subjectivityUid === id);

        } else {
            index = this.subjectivities.findIndex((s) => s.subjectivity.subjectivityId.toString() === id);
        }

        if (index !== -1) {
            this.subjectivities.splice(index, 1);
            this.bindQuoteForm.get("subjectivities").patchValue(this.subjectivities);
        }
    }

    public nextStep() {
        if (this.currentStep < Object.keys(this.steps).length - 1) {
            this.setStep(this.currentStep + 1);
        }
    }

    public previousStep() {
        if (this.currentStep > 0) {
            this.setStep(this.currentStep - 1);
        }
    }

    public isEnabled(stepNumber: number) {
        return stepNumber <= this.currentStep + 1;
    }

    public get ABN(): string {
        const abnAnswer = (this.bindQuoteForm.controls.basic.get("riskQuestionAnswers").value as RiskQuestionAnswer[]).find((x) => x.riskQuestionTag === "ABN");

        return abnAnswer ? abnAnswer.text : null;
    }

    public get surplusLinesBroker(): number {
        const surplusLinesBrokerId = this.bindQuoteForm.controls.basic.get("surplusLinesBroker");

        return surplusLinesBrokerId ? surplusLinesBrokerId.value : null;
    }

    public recalculatePremiums() {
        const newInceptionDate: Date = this.bindQuoteForm.get("basic").get("inceptionDate").value;
        const newExpiryDate: Date = this.bindQuoteForm.get("basic").get("expiryDate").value;

        this.isCalculating = true;
        this.pricingService.getProRatedPricingInformation(this.quote, newInceptionDate, newExpiryDate).subscribe((pricingResult) => {
            this.pricingService.updateProRatedPricingInformationWithFullFee(this.quote.pricingInformation, pricingResult.pricingInformations);
            this.locationOutputs = pricingResult.locationOutputs;
            this.isCalculating = false;
        });
    }

    public bindTheQuote(): void {
        const bindRequest: QuoteBindRequest = new QuoteBindRequest();
        const user = this.userService.getUser();

        bindRequest.quoteId = this.quote.quoteReference;
        bindRequest.cfcContactId = user.cfcContactId;
        bindRequest.insuredLocation = this.quote.insuredLocation;
        bindRequest.premium = this.quote.premium;
        bindRequest.product = this.quote.product;
        bindRequest.brokerTeam = this.quote.brokerTeam;

        bindRequest.inceptionDate = this.bindQuoteForm.get("basic").get("inceptionDate").value;
        bindRequest.expiryDate = this.bindQuoteForm.get("basic").get("expiryDate").value;
        bindRequest.receivedDate = this.bindQuoteForm.get("basic").get("receivedDate").value;
        bindRequest.localBroker = this.bindQuoteForm.get("basic").get("localBroker").value;
        bindRequest.australianBusinessNumber = this.ABN;

        bindRequest.quoteSubjectivities = this.subjectivities;
        bindRequest.commissionInformation = this.quote.commissionInformation;
        bindRequest.isDirectBilling = this._isDirectBillingEnabled;
        bindRequest.payment = this.getPayment(this._isDirectBillingEnabled, this._paymentPeriod);
        bindRequest.currency = this.quote.currency;

        const inputPricing = this.bindQuoteForm.value.pricing.businessCategories;
        const updatedPricing = this.quote.pricingInformation.slice(0); // clone array
        for (const businessCategory of inputPricing) {
            const tag = businessCategory.tagName;
            const premium = businessCategory.quoted as number;
            const price = updatedPricing.find((x) => x.businessLine.name === tag);
            price.quoted = premium;
        }

        bindRequest.surplusLineBroker = this.bindQuoteForm.get("basic").get("surplusLinesBroker").value;
        bindRequest.pricingInformation = updatedPricing;
        let totalPremium = 0;
        updatedPricing.forEach((x) => (totalPremium += x.quoted));
        bindRequest.totalPremium = totalPremium;

        if (this.quoteService.hasQuoteLocationPremiums()) {
            bindRequest.policyLocationPremiums = this.quoteService.calculatePolicyLocationPremiums(updatedPricing, this.locationOutputs);
        }

        this.checkAndUpdateBlastZoneCapacity(bindRequest).subscribe((result) => {
            if (!!result) {
                this.bindQuote(bindRequest);
            }
            else {
                this._toastrService.show('Capacity not available in one or more locations!', ToastType.Error);
                this.isBinding = false;
                this.dialogRef.close();
            }
        });
    }

    private bindQuote(bindRequest: QuoteBindRequest) {
        this.isBinding = true;
        this.quoteHttpService.bindQuote(bindRequest).subscribe((response) => {
            this.bindComplete(response);
        });
    }

    public get disableNext(): boolean {
        const basicStepLoaded = this.basicStepComponent && !this.basicStepComponent.isLoading;
        return this.currentStep === this.steps.pricing || (this.currentStep === this.steps.basic && !basicStepLoaded);
    }

    private getCurrentFormGroup(): FormGroup {
        switch (this.currentStep) {
            case this.steps.basic:
                return this.bindQuoteForm.get("basic") as FormGroup;
            case this.steps.subjectivities:
                return this.bindQuoteForm.get("subjectivities") as FormGroup;
            case this.steps.pricing:
                return this.bindQuoteForm.get("pricing") as FormGroup;
        }

        return null;
    }

    private createFormGroup(): FormGroup {
        return this.formBuilder.group({
            basic: this.getBasicFormGroup(),
            subjectivities: [this.subjectivities],
            pricing: [null],
        });
    }

    private getBasicFormGroup(): FormGroup {
        if (!this.quote.expiryDate) {
            this.quote.expiryDate = moment(this.quote.inceptionDate).add(this.quote.policyPeriod, "month").toDate();
        }

        const formGroup = this.formBuilder.group({
            inceptionDate: [moment.utc(this.quote.inceptionDate), Validators.required],
            expiryDate: [moment.utc(this.quote.expiryDate), Validators.required],
            receivedDate: [moment.utc(new Date()).startOf("day"), Validators.required],
            surplusLinesBroker: [this.quote.surplusLineBroker, AutocompleteValidator<SurplusLine>((x) => x.id)],
            localBroker: [this.quote.localBroker],
            riskQuestionAnswers: [Object.assign([], this.quote.riskQuestionAnswers)],
        });

        formGroup.setValidators(bindQuoteBasicValidator);

        return formGroup;
    }

    private subscribeFormChanges() {
        this.bindQuoteForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((formValues) => {
            this.validateReceivedDate(formValues);
        });
    }

    private validateReceivedDate(formValues) {
        if (this.isValidFormatReceivedDate(formValues.basic.receivedDate)) {
            this.receivedDate = this.setDateFormat(formValues.basic.receivedDate);
            this.bindQuoteForm.get("basic").get("receivedDate").setErrors(null);

            this.bordereauHttpService
                .isReceivedDateValid(this.receivedDate)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe((isValidReceivedDate) => {
                    if (isValidReceivedDate === false) {
                        this.setFieldValidation("receivedDate", "monthClosed");
                    }
                });
        } else if (!moment(formValues.basic.receivedDate).isValid()) {
            this.setFieldValidation("receivedDate", "invalidDate");
        }
    }

    private setFieldValidation(field: string, errorProperty: string) {
        this.bindQuoteForm
            .get("basic")
            .get(field)
            .setErrors({ [errorProperty]: true });
        this.bindQuoteForm.get("basic").get(field).markAsTouched();
    }

    private isValidFormatReceivedDate(receivedDate) {
        return receivedDate && moment(receivedDate).isValid() && this.setDateFormat(receivedDate) !== this.receivedDate;
    }

    private setDateFormat(date) {
        return typeof date === "string" ? date : date.toISOString();
    }

    private bindComplete(response: QuoteBindResponse) {
        const pricing = this.bindQuoteForm.value.pricing;
        const initiateDirectBilling$ = this.initiateDirectBilling(response.policyNumber, pricing.contact);
        const billingComplete$ = !response?.bindError && pricing.isDirectBilling ? initiateDirectBilling$ : of(null);

        billingComplete$.pipe(first()).subscribe(() => {
            this.onCloseModal(response);
            this.isBinding = false;
        });
    }

    private initiateDirectBilling = (policyNumber: string, contact): Observable<void> => {
        return this.transactionBillingHttpService.put(policyNumber, contact).pipe(catchError(() => this.openConfirmationModal(policyNumber, contact)));
    };

    private openConfirmationModal = (policyNumber: string, contact): Promise<void> => {
        const dialogModel = {
            title: "Initiating direct billing failed",
            question: `Do you wish to "Retry" direct billing or "Cancel", therefore reverting to agency billing?`,
            confirmationButtonLabel: "Retry",
            cancellationButtonLabel: "Cancel",
        };

        return new Promise((resolve) => {
            this.modalDialogService.openDialog<ConfirmationModalComponent, string>(
                ConfirmationModalComponent,
                ConfirmationModalConfig.dialog.matDialogConfig,
                (modalConfig) => (modalConfig.dialogModel = dialogModel),
                (button) => (button == "confirm-button" ? this.initiateDirectBilling(policyNumber, contact).pipe(first()).subscribe(resolve) : resolve())
            );
        });
    };

    private getPayment(isDirectBilling: boolean, paymentPeriod: string): Payment {
        const payment = new Payment();

        payment.period = paymentPeriod;
        payment.method = (isDirectBilling == true) ? PaymentMethod.DirectBilling : PaymentMethod.Agency;
        return payment;
    }

    private checkAndUpdateBlastZoneCapacity(bindRequest: QuoteBindRequest): Observable<boolean> {
        
        if (this.quoteService.isMultipleProperties()) {
            this.blastZoneHttpService.getBlastZoneDetails(this.quote.blastZoneReferenceId).subscribe((result) => {
                if (!!result) {
                    const propertyLimitBlastZoneRequest: PropertyLimitBlastZoneCapacityRequest = {
                        propertyLimits: this.quote.propertyLimits,
                        floatingValue: sumFloatingValues(this.quote.propertyLimitFloatingValues),
                        firstLossLimitValue: this.quote.firstLossLimitValue ?? result.firstLossLimit,
                        inceptionDate: bindRequest.inceptionDate,
                        expiryDate: bindRequest.expiryDate,
                        reservationExpiryDate: bindRequest.expiryDate,
                        clientId: this.quote.client.uid,
                        isRenewable: true,
                    };

                    return this.blastZoneHttpService.updateBlastZoneReservation(propertyLimitBlastZoneRequest);
                }
                else {
                    this._toastrService.show('Capacity not available in one or more locations!', ToastType.Error);
                    this.isBinding = false;
                    this.dialogRef.close();
                }
            });
        }
        return of(true);
    }

}
