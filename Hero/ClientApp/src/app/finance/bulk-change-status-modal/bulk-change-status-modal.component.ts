import { Component, Input, SimpleChanges, OnChanges, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
    FinancialItemStatus,
    ClaimFinancialItemStatusChangeRequestDetail,
    CfcBankAccount,
    ClaimFinancialItemStatusHistoryDetail,
    PaymentRequest
} from '@app/models';
import { Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ErrorMessageHandlerService } from '@app/services/error-message-handler.service';
import { PaymentRequestsHttpService } from '@app/services/payment-requests-http.service';
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { Observable } from 'rxjs';
import { DateValidators } from '@app/validators/date.validators';
import * as moment from "moment";
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'bulk-change-status-modal',
    templateUrl: './bulk-change-status-modal.component.html',
    styleUrls: ['./bulk-change-status-modal.component.scss']
})
export class BulkChangeStatusModalComponent implements OnChanges, OnInit, OnDestroy {
    public statusForm: FormGroup;
    public statusOptions: Array<{ text: string, value: number }>;
    private _pendingPaymentRequests: PaymentRequest[] = null;
    private ngUnsubscribe: Subject<any> = new Subject();
    public displayErrorMessage: boolean = false;
    public cfcBankAccounts: Observable<CfcBankAccount[]>;
    public foundBankAccounts: CfcBankAccount[];
    public failedSaveCount: number = 0;
    public displayMessage: string = "";
    public queryInProgress: boolean = false;

    @Input()
    get pendingPaymentRequests(): PaymentRequest[] {
        return this._pendingPaymentRequests;
    }

    set pendingPaymentRequests(val: PaymentRequest[]) {
        this._pendingPaymentRequests = val;

    }

    /** change-status-modal ctor */
    constructor(
        private fb: FormBuilder,
        private ref: ChangeDetectorRef,
        private messageErrorHandler: ErrorMessageHandlerService,
        private readonly dialogRef: MatDialogRef<BulkChangeStatusModalComponent>,
        private bankAccountService: CfcBankAccountService,
        private paymentRequestHttpService: PaymentRequestsHttpService
    ) {
        this.statusOptions = [
            {
                text: FinancialItemStatus[FinancialItemStatus.Requested],
                value: FinancialItemStatus.Requested
            },
            {
                text: "Pending Approval",
                value: FinancialItemStatus.PendingApproval
            },
            {
                text: FinancialItemStatus[FinancialItemStatus.Paid],
                value: FinancialItemStatus.Paid
            },
            {
                text: FinancialItemStatus[FinancialItemStatus.Rejected],
                value: FinancialItemStatus.Rejected
            },
            {
                text: "Fully Received",
                value: FinancialItemStatus.Received
            },
            {
                text: "Rejected - Adjusters Request",
                value: FinancialItemStatus.RejectedAdjustersRequest
            },
            {
                text: "Rejected - Amount Requested vs Invoice Amount Differ",
                value: FinancialItemStatus.RejectedAmountDiffer
            },
            {
                text: "Rejected - Incorrect Information",
                value: FinancialItemStatus.RejectedIncorrectInformation
            },
            {
                text: "Rejected - Missing Bank Details/ Supporting Documentation",
                value: FinancialItemStatus.RejectedMissingDetails
            },
            {
                text: "Rejected - LF/ CC Raised Inadvertently",
                value: FinancialItemStatus.RejectedRaisedInadvertently
            },
            {
                text: "Rejected - Duplicate",
                value: FinancialItemStatus.RejectedDuplicate
            },
            {
                text: "Finance - Roe Correction",
                value: FinancialItemStatus.FinanceRoeCorrection
            },
            {
                text: "Finance - Reserve Correction",
                value: FinancialItemStatus.FinanceReserveCorrection
            },
            {
                text: "Sanctions - Referral",
                value: FinancialItemStatus.SanctionsReferral
            }
        ];
    }

    public ngOnInit(): void {
        this.failedSaveCount = 0;

        this.displayMessage = (this.pendingPaymentRequests ? this.pendingPaymentRequests.length : 0) + " Selected";

        this.statusForm = this.fb.group({
            status: null,
            notes: [""]
        });

        this.statusForm.controls.status.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(x => {
                this.onStatusChange(x);
            });

        this.cfcBankAccounts = this.bankAccountService.getBankAccounts();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes && changes.pendingPaymentRequests) {
            this.statusForm.patchValue({
                //status: this.pendingPaymentRequest.itemStatusId
            });
        }
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public paidFormGroup(): FormGroup {
        return this.statusForm.controls.paidGroup as FormGroup;
    }

    public onStatusChange(status: FinancialItemStatus) {
        this.cfcBankAccounts
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(result => {
                this.foundBankAccounts = result;
            });

        if (coerceNumberProperty(status) === FinancialItemStatus.Paid ||
            coerceNumberProperty(status) === FinancialItemStatus.Received) {
            this.setupPaidFormGroup(status);

        } else {
            if (this.paidFormGroup()) {
                this.statusForm.removeControl("paidGroup");
            }
        }
        this.ref.detectChanges();
    }

    public setupPaidFormGroup(status: FinancialItemStatus) {
        this.statusForm.addControl(
            "paidGroup",
            this.fb.group({
                paidDate: [moment(), [Validators.required, DateValidators.date()]],
            })
        );
    }

    public onSubmit() {
        let statusHistoryDetails = this.bindDataForSubmit(this.statusForm.value);
        this.queryInProgress = true;
        this.paymentRequestHttpService.PostClaimFinancialItemStatusChanges(statusHistoryDetails)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(results => {

                this.failedSaveCount = results;

                if (this.failedSaveCount > 0) {
                    this.displayErrorMessage = true;
                    this.messageErrorHandler.handleError(this.failedSaveCount + " Failed");
                    this.queryInProgress = false;
                } else {
                    this.onCloseModal();
                }
            },
                err => {
                    this.displayErrorMessage = true;
                    this.messageErrorHandler.handleError(`Unable to change status. ${err.error.Message}`);
                    this.queryInProgress = false;
                });
    }

    public bindDataForSubmit(data: { status: number, notes: string, paidGroup: any }): ClaimFinancialItemStatusChangeRequestDetail[] {

        const statusHistoryDetails = [];

        for (const pendingPaymentRequest of this.pendingPaymentRequests) {
            let statusHistoryDetail = new ClaimFinancialItemStatusChangeRequestDetail();
            statusHistoryDetail.claimFinancialItemStatusHistoryDetail = new ClaimFinancialItemStatusHistoryDetail();
            statusHistoryDetail.claimFinancialItemStatusHistoryDetail.notes = data.notes;
            statusHistoryDetail.claimFinancialItemStatusHistoryDetail.addedOn = new Date(Date.now());
            statusHistoryDetail.claimFinancialItemStatusHistoryDetail.claimFinancialItemStatusId = coerceNumberProperty(data.status);

            statusHistoryDetail.claimFinancialItemStatusHistoryDetail.claimFinancialItemId = coerceNumberProperty(pendingPaymentRequest.claimFinancialItemId);
            statusHistoryDetail.financialLedgerReference = pendingPaymentRequest.ledgerReference;

            // paid or received status only fields
            if (data.paidGroup) {
                statusHistoryDetail.accountingReferenceDate = data.paidGroup.paidDate;

                let requestAmountMultiplier = (statusHistoryDetail.claimFinancialItemStatusHistoryDetail.claimFinancialItemStatusId === FinancialItemStatus.Received) ? -1 : 1;
                statusHistoryDetail.bankAmount = pendingPaymentRequest.amount * requestAmountMultiplier;

                statusHistoryDetail.cfcBankAccountId = this.bankAccountService.getSuggestedAccount(this.foundBankAccounts, pendingPaymentRequest).cfcBankAccountId;
            }
            statusHistoryDetails.push(statusHistoryDetail);
        }
        return statusHistoryDetails;
    }

    public onCloseModal() {
        this.dialogRef.close(this.pendingPaymentRequests);
    }
}
