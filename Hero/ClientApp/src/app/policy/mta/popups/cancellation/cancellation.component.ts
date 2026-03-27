import { getCurrencySymbol } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Message, MessageType } from "@app/models";
import { CancellationMtaRequest } from "@app/policy/models/CancellationMtaRequest";
import { GetCancellationPremiumResponse } from "@app/policy/models/GetCancellationPremiumResponse";
import { MtaService } from "@app/policy/services/mta.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { ICurrency } from "@app/shared/form-creator/ICurrency";
import { ConfirmationModalComponent } from "@app/shared/modals/confirmation-modal/confirmation-modal.component";
import { ConfirmationModalConfig } from "@app/shared/modals/confirmation-modal/confirmation-modal.config";
import { Guid } from "guid-typescript";
import * as moment from "moment";
import { BehaviorSubject, combineLatest, EMPTY, Observable, of, ReplaySubject } from "rxjs";
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    finalize,
    map,
    shareReplay,
    startWith,
    switchMap,
    takeUntil,
    tap
} from "rxjs/operators";
import { MtaModalModel } from "../mta-modal.model";
import { MtaSendEmailModalConfig } from "../send-email/mta-send-email-modal.config";
import { MtaSendEmailComponent } from "../send-email/mta-send-email.component";
import { MtaSendEmailModel } from "../send-email/mta-send-email.model";
import { CancellationTypes } from "./cancellation-types.enum";

@Component({
    selector: "mta-cancellation",
    templateUrl: "cancellation.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MtaCancellationComponent implements OnInit, OnDestroy {
    public formGroup: FormGroup;

    public type$: Observable<string>;
    public returnTax$: Observable<number>;
    public currency$: Observable<ICurrency>;
    public dialogModel: MtaModalModel;
    public isPremiumReadOnly$: Observable<boolean>;
    public isSaveButtonDisabled$: Observable<boolean>;
    public policyPeriodTooltip: string;

    protected sendEmailModalModel: MtaSendEmailModel;

    private _isLoadingSubject$ = new BehaviorSubject(true);
    private _isSavingSubject$ = new BehaviorSubject(false);
    private _mtaIdSubject$ = new BehaviorSubject<Guid>(null);

    private readonly _destroyed$ = new ReplaySubject<void>(1);
    private get _policyNumber() { return this.dialogModel?.policy.reference; }
    private get _inceptionDate() { return this.dialogModel?.policy.inceptionDate; }

    constructor(
        private readonly messageService: MessageService,
        private readonly modalDialogService: ModalDialogService,
        private readonly mtaService: MtaService,
        private readonly userService: UserService
    ) { }

    ngOnInit(): void {
        this.policyPeriodTooltip = `Expiration Date: ${moment(this.dialogModel.policy.expirationDate).format("DD/MM/YYYY")}`;

        this.formGroup = this.buildFormGroup();

        const effectiveDate$ = this.getEffectiveDate$();
        const returnedPremium$ = this.getPremium$(effectiveDate$);

        this.currency$ = this.getCurrency$(returnedPremium$);
        this.type$ = this.getType$(effectiveDate$);
        this.returnTax$ = this.getReturnTax$(returnedPremium$, this.type$);

        this.isPremiumReadOnly$ = combineLatest([this.mtaId$, this.isSaving$, this.type$])
            .pipe(
                map(([mtaId, isSaving, type]) => !!mtaId || isSaving || type === CancellationTypes.AbInitio)
            );

        this.isSaveButtonDisabled$ = combineLatest([this.mtaId$, this.isSaving$, this.isLoading$, this.formGroup.valueChanges.pipe(startWith(""))])
            .pipe(
                map(([mtaId, isSaving, isLoading]) => !!mtaId || isSaving || isLoading || this.formGroup.invalid)
            );

        this.watchTypeChange();
        this.watchPremiumChange(returnedPremium$);
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    public isLoading$: Observable<boolean> = this._isLoadingSubject$.asObservable();

    public isSaving$: Observable<boolean> = this._isSavingSubject$.asObservable();

    public mtaId$: Observable<Guid> = this._mtaIdSubject$.asObservable();

    public openCancelConfirmationModal(): void {
        if (this.formGroup.invalid) {
            this.formGroup.markAllAsTouched();
        }
        else {
            this.modalDialogService.openDialog<ConfirmationModalComponent, string>(
                ConfirmationModalComponent,
                ConfirmationModalConfig.dialog.matDialogConfig,
                (modalConfig) => {
                    const confirmationModalModel = {
                        title: "Confirmation required",
                        question: `Are you sure you want to cancel Policy ${this._policyNumber}?`,
                        confirmationButtonLabel: "Yes",
                        cancellationButtonLabel: "No",
                    };

                    modalConfig.dialogModel = confirmationModalModel;
                },
                (result) => {
                    if (result === "confirm-button") {
                        this.cancel();
                    }
                }
            );
        }
    }

    public openSendEmailModal(): void {
        this.sendEmailModalModel = { mtaId: this._mtaIdSubject$.getValue(), policy: this.dialogModel.policy };
        this.modalDialogService.openDialog<MtaSendEmailComponent, MtaSendEmailModel>(
            MtaSendEmailComponent,
            MtaSendEmailModalConfig.dialog.matDialogConfig,
            (modalConfig) => {
                modalConfig.user = this.userService.getUser();
                modalConfig.dialogModel = this.sendEmailModalModel;
                modalConfig.readOnly = false;
            },
            (result) => this.sendEmailModalModel = result
        );
    }

    private getEffectiveDate$(): Observable<Date> {
        return this.formGroup.controls.effectiveDate.valueChanges.pipe(
            debounceTime(500),
            startWith(new Date(this._inceptionDate)),
            distinctUntilChanged((previousDate, currentDate) => previousDate?.toISOString() === currentDate?.toISOString()),
            shareReplay(1)
        );
    }

    private getReturnTax$(premium$: Observable<GetCancellationPremiumResponse>, type$: Observable<string>): Observable<number> {
        const returnPremiumValueChanges$ = this.formGroup.controls.totalReturnPremium.valueChanges.pipe(
            startWith(0),
            debounceTime(250),
            distinctUntilChanged()
        );

        return combineLatest([returnPremiumValueChanges$, premium$, type$]).pipe(
            map(([value, premiumResponse, type]) =>
                !!premiumResponse
                    ? (type === CancellationTypes.AbInitio ? premiumResponse.totalReturnPremium : value) * premiumResponse.taxRate
                    : null
            ),
            shareReplay(1)
        );
    }

    private setPremiumValidators(type: CancellationTypes): void {
        if (type === CancellationTypes.AbInitio) {
            this.formGroup.controls.totalReturnPremium.clearValidators();
            this.formGroup.controls.returnFee.clearValidators();
        } else {
            this.formGroup.controls.totalReturnPremium.setValidators(Validators.required);
            this.formGroup.controls.returnFee.setValidators(Validators.required);
        }
    }

    private buildFormGroup(): FormGroup {
        return new FormGroup({
            cancellationReason: new FormControl(null, [Validators.required]),
            effectiveDate: new FormControl(moment(this._inceptionDate), [Validators.required]),
            returnFee: new FormControl(Validators.required),
            totalReturnPremium: new FormControl()
        });
    }

    private getPremium$(effectiveDate$: Observable<Date>): Observable<GetCancellationPremiumResponse> {
        return effectiveDate$.pipe(
            tap(() => this.messageService.clearAllMessages()),
            tap(() => this._isLoadingSubject$.next(true)),
            switchMap(effectiveDate => !!effectiveDate ? this.getCancellationPremium(this._policyNumber, effectiveDate) : of(null)),
            tap(() => this._isLoadingSubject$.next(false)),
            shareReplay(1)
        );
    }

    private getCancellationPremium(policyNumber: string, effectiveDate: Date): Observable<GetCancellationPremiumResponse> {
        return this.mtaService
            .getCancellationPremium(policyNumber, effectiveDate)
            .pipe(catchError(() => this.handleLoadPremiumError()));
    }

    private getCurrency$(premium$: Observable<GetCancellationPremiumResponse>): Observable<ICurrency> {
        return premium$.pipe(map((premium) => !!premium ? <ICurrency>{
            isoCode: premium.currencyIsoCode,
            symbol: getCurrencySymbol(premium.currencyIsoCode, "narrow")
        } : null));
    }

    private getType$(effectiveDate$: Observable<Date>): Observable<string> {
        return effectiveDate$.pipe(
            map(effectiveDate => {
                if (!effectiveDate) return null;
                else return moment(this._inceptionDate).isSame(effectiveDate) ? CancellationTypes.AbInitio : CancellationTypes.MidTerm;
            })
        );
    }

    private watchTypeChange(): void {
        this.type$.pipe(
            takeUntil(this._destroyed$),
            tap(type => this.setPremiumValidators(CancellationTypes[type]))
        ).subscribe();
    }

    private watchPremiumChange(premium$: Observable<GetCancellationPremiumResponse>): void {
        premium$
            .pipe(takeUntil(this._destroyed$), tap(premium => {
                this.formGroup.controls.totalReturnPremium.setValue(premium?.totalReturnPremium)
                this.formGroup.controls.returnFee.setValue(premium?.returnFee)
            }))
            .subscribe();
    }

    private handleLoadPremiumError(): Observable<GetCancellationPremiumResponse> {
        this.messageService.sendMessage(<Message>{
            type: MessageType.Error,
            text: "An error occurred while loading the policy premium. Please contact IT Support."
        });

        return of(null);
    }

    public cancel(): void {
        const cancellationRequest: CancellationMtaRequest = this.createCancellationRequest();

        this.messageService.clearAllMessages();
        this._isSavingSubject$.next(true);

        this.mtaService
            .postCancellation(cancellationRequest, this._policyNumber)
            .pipe(
                tap(response => this.setMtaId(response.mtaId)),
                catchError(error => this.handleCancelError(error)),
                finalize(() => this._isSavingSubject$.next(false))
            )
            .subscribe();
    }

    private createCancellationRequest(): CancellationMtaRequest {
        return {
            cfcUserId: this.userService.getUser().cfcContactUid,
            cancellationReason: this.formGroup.value.cancellationReason,
            effectiveDate: this.formGroup.value.effectiveDate,
            returnPremium: this.formGroup.value.totalReturnPremium,
            returnFee: this.formGroup.value.returnFee
        };
    }

    private setMtaId(mtaId: string): void {
        if (!!mtaId && Guid.isGuid(mtaId)) {
            this._mtaIdSubject$.next(Guid.parse(mtaId));
        } else {
            throw { error: JSON.stringify({ validationMessages: ["MTA ID not returned."] }) };
        }
    }

    private handleCancelError(error: any): Observable<never> {
        let errormessage = error.error = JSON.parse(error.error);

        this.messageService.sendMessage({
            text: "An error occurred while submitting your change. Please contact IT Support.",
            type: MessageType.Error,
            messageList: errormessage.validationMessages
        });

        return EMPTY;
    }
}
