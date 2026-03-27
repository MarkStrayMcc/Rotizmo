import { coerceNumberProperty } from "@angular/cdk/coercion";
import {
  ChangeDetectorRef, Component,
  Input, OnChanges, OnDestroy, OnInit, SimpleChanges
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { CfcBankAccountCurrency } from "@app/finance/shared/cfc-bank-account-currency";
import { LEDGER_CURRENCIES } from "@app/finance/shared/ledger.currencies";
import {
  Carrier, CfcBankAccount,
  ClaimFinancialItemStatusChangeRequestDetail,
  ClaimFinancialItemStatusHistoryDetail,
  FinancialItemStatus,
  PaymentRequest
} from "@app/models";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { PaymentRequestsHttpService } from "@app/services/payment-requests-http.service";
import { DateValidators } from "@app/validators/date.validators";
import * as moment from "moment";
import { Observable, Subject, Subscription } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { BinderSectionParticipationLookupService } from "../lookups/binder-section-participation-lookup.service";
import { paymentStatuses } from "./PaymentStatuses";

@Component({
  selector: "change-status-modal",
  templateUrl: "./change-status-modal.component.html",
  styleUrls: ["./change-status-modal.component.scss"]
})
/** change-status-modal component*/
export class ChangeStatusModalComponent
  implements OnChanges, OnInit, OnDestroy {

  @Input()
  public get pendingPaymentRequest(): PaymentRequest {
    return this._pendingPaymentRequest;
  }

  public set pendingPaymentRequest(val: PaymentRequest) {
    this._pendingPaymentRequest = val;
    if (this.statusForm) {
      this.statusForm.patchValue({
        status: this._pendingPaymentRequest.itemStatusId
      });
      this.statusForm.markAsPristine();
      this.statusForm.markAsUntouched();
    }
  }

  public statusForm: FormGroup;
  public statusOptions: Array<{ text: string; value: number }>;

  public displayErrorMessage = false;
  public cfcBankAccounts: Observable<CfcBankAccount[]>;
  public carriers: Carrier[];
  public suggestedAccountId: number = null;
  public supportedCurrencyCodes = LEDGER_CURRENCIES;
  public selectedCurrency: CfcBankAccountCurrency = null;

  public submitButtonMessage = "OK";
  public queryInProgress = false;
  public isLoadingCarriers = true;

  public currentStatus: FinancialItemStatus;
  public financialItemStatusType = FinancialItemStatus;

  private foundBankAccounts: CfcBankAccount[];
  private paidFormGroupSubscription: Subscription;
  private carrierChangeSubscription: Subscription;

  private _pendingPaymentRequest: PaymentRequest = null;
  private ngUnsubscribe: Subject<any> = new Subject();
  private selectedCarrier: Carrier;

  /** change-status-modal ctor */
  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private messageErrorHandler: ErrorMessageHandlerService,
    private readonly dialogRef: MatDialogRef<ChangeStatusModalComponent>,
    private bankAccountService: CfcBankAccountService,
    private paymentRequestHttpService: PaymentRequestsHttpService,
    private binderSectionParticipationLookupService: BinderSectionParticipationLookupService
  ) {
    this.statusOptions = paymentStatuses;
  }

  public ngOnInit(): void {
    this.loadStatusOptions();

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
    this.loadCarriers();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.pendingPaymentRequest) {
      this.statusForm.patchValue({
        status: this.pendingPaymentRequest.itemStatusId
      });
    }
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    if (this.carrierChangeSubscription) {
      this.carrierChangeSubscription.unsubscribe();
    }
  }

  public paidFormGroup(): FormGroup {
    return this.statusForm.controls.paidGroup as FormGroup;
  }

  public onStatusChange(status: FinancialItemStatus) {
    this.currentStatus = status;

    if (
      coerceNumberProperty(status) === FinancialItemStatus.Paid ||
      coerceNumberProperty(status) === FinancialItemStatus.Received ||
      coerceNumberProperty(status) === FinancialItemStatus.PartReceived
    ) {
      this.setupPaidFormGroup(status);
      this.selectedCarrier = null;
      this.paidFormGroup().controls.carrierId.setValue(null);
      this.paidFormGroup().controls.originalAmount.setValue(0);

      if (!this.suggestedAccountId) {
        this.cfcBankAccounts
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(x => {
            this.foundBankAccounts = x;
            this.suggestedAccountId = this.bankAccountService.getSuggestedAccount(
              this.foundBankAccounts,
              this.pendingPaymentRequest
            ).cfcBankAccountId;
            this.paidFormGroup().controls.cfcBankAccountId.setValue(
              this.suggestedAccountId
            );
            // make sure default for amount is pending payment amount
            this.recalculateAmounts();
          });
      }
    } else {
      if (this.paidFormGroup()) {
        this.statusForm.removeControl("paidGroup");
        this.paidFormGroupSubscription.unsubscribe();
        this.carrierChangeSubscription.unsubscribe();
      }
    }

    if (coerceNumberProperty(status) === FinancialItemStatus.PartReceived) {
      this.selectDefaultCarrier();
    }

    this.ref.detectChanges();
  }

  public onSubmit() {
    const item = this.bindDataForSubmit(this.statusForm.value);
    const status =
      item.claimFinancialItemStatusHistoryDetail.claimFinancialItemStatusId;

    switch (status) {
      case FinancialItemStatus.PendingApproval:
        if (this.submitButtonMessage === "Confirm") {
          this.saveStatusChange(item);
        } else {
          this.performSanctionCheck(item);
        }
        break;
      case FinancialItemStatus.PartReceived:
      default:
        this.saveStatusChange(item);
    }
  }

  public onCloseModal() {
    this.dialogRef.close(this.pendingPaymentRequest);
  }

  private loadStatusOptions() {
    const partReceivedStatusId = FinancialItemStatus.PartReceived;
    const currentStatusIdToRemove =
      this.pendingPaymentRequest !== null
        ? this.pendingPaymentRequest.itemStatusId
        : null;

    this.statusOptions = this.statusOptions.filter(
      item => item.value !== currentStatusIdToRemove || item.value === partReceivedStatusId
    );
  }

  private setupPaidFormGroup(status: FinancialItemStatus) {
    const requestAmountMultiplier = this.requestAmountMultiplier();

    this.statusForm.addControl(
      "paidGroup",
      this.fb.group({
        cfcBankAccountId: [this.suggestedAccountId, [Validators.required]],
        carrierId: null,
        paidDate: [moment(), [Validators.required, DateValidators.date()]],
        originalCurrencyCode: [
          {
            value: this.pendingPaymentRequest.currency.isoCode,
            disabled: true
          }
        ],
        totalOriginalAmount: [
          {
            value: this.pendingPaymentRequest.amount * requestAmountMultiplier,
            disabled: true
          }
        ],
        bankAccountCurrencyId: [
          {
            value: this.pendingPaymentRequest
              ? this.pendingPaymentRequest.currency.id
              : this.getCurrencyForAccount(this.suggestedAccountId),
            disabled: true
          },
          [Validators.required]
        ],
        participation: [
          {
            value: "0%",
            disabled: true
          },
          [Validators.required]
        ],
        originalAmount: [
          {
            value: 0
          }
        ],
        accountAmount: [
          {
            value: this.pendingPaymentRequest
              ? this.pendingPaymentRequest.amount * requestAmountMultiplier
              : 0
          },
          [Validators.required]
        ]
      })
    );

    this.paidFormGroupSubscription = this.paidFormGroup()
      .controls.cfcBankAccountId.valueChanges.pipe(
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((value: number) => {
        this.onBankAccountChanged(value);
      });

    this.carrierChangeSubscription = this.paidFormGroup().controls.carrierId.valueChanges.subscribe(
      value => {
        this.onCarrierChanged(value);
      }
    );
  }

  private onCarrierChanged(value: string) {
    const carriers = this.carriers
      ? this.carriers.filter(c => c.carrierName === value)
      : null;

    if (carriers && carriers.length > 0) {
      this.selectedCarrier = carriers[0];
    }

    this.recalculateAmounts();
  }

  private recalculateAmounts() {
    const requestAmountMultiplier = this.requestAmountMultiplier();
    const totalOriginalAmount = this.pendingPaymentRequest.amount * requestAmountMultiplier;
    let participationPercent = 0;
    let originalAmount = totalOriginalAmount;

    if (this.selectedCarrier) {
      participationPercent = this.selectedCarrier.participationPercent;
      originalAmount *= participationPercent / 100;
    }

    const percentTxt = +participationPercent + "%";
    if (this.paidFormGroup()) {
      this.paidFormGroup().controls.totalOriginalAmount.setValue(totalOriginalAmount);
      this.paidFormGroup().controls.originalAmount.setValue(originalAmount);
      this.paidFormGroup().controls.accountAmount.setValue(originalAmount);
      this.paidFormGroup().controls.participation.setValue(percentTxt);
    }
  }

  private onBankAccountChanged(value: number) {
    if (this.foundBankAccounts && this.paidFormGroup()) {
      const accountCurrencyId = this.getCurrencyForAccount(value);
      const oldAccountCurrencyId = this.paidFormGroup().controls
        .bankAccountCurrencyId.value;

      this.selectedCurrency = this.supportedCurrencyCodes.find(cur => {
        return cur.id === accountCurrencyId;
      });

      if (oldAccountCurrencyId !== accountCurrencyId) {
        this.paidFormGroup().controls.accountAmount.setValue(0);
      }

      this.paidFormGroup().patchValue({
        bankAccountCurrencyId: accountCurrencyId
      });
    }
  }

  private getCurrencyForAccount(acctNumber: number): number {
    if (this.foundBankAccounts) {
      const particularAccount = this.foundBankAccounts.find(acct => {
        return acct.cfcBankAccountId === coerceNumberProperty(acctNumber);
      });
      return particularAccount.bankAccountCurrencyId;
    }

    return null;
  }

  private requestAmountMultiplier(): number {
    const localCurrentStatus = coerceNumberProperty(this.currentStatus);
    return (localCurrentStatus === FinancialItemStatus.Received ||
      localCurrentStatus === FinancialItemStatus.PartReceived)
      ? -1
      : 1;
  }

  private loadCarriers() {
    if (this.pendingPaymentRequest) {
      let binderDescription = null;
      let sectionShortCode = null;
      let binderYear = null;
      let sectionId = null;

      if (this.pendingPaymentRequest.binderSection) {
        binderDescription = this.pendingPaymentRequest.binderSection.binderDescription;
        sectionShortCode = this.pendingPaymentRequest.binderSection.shortCode;
        binderYear = this.pendingPaymentRequest.binderSection.binderYear;
        sectionId = this.pendingPaymentRequest.binderSection.sectionId;
      }

      this.isLoadingCarriers = true;
      this.binderSectionParticipationLookupService
        .getData(binderDescription, sectionShortCode, binderYear, sectionId)
        .pipe(
          map(binderSectionParticipations => {
            return binderSectionParticipations[0]
              ? binderSectionParticipations[0].carriers
              : null;
          })
        )
        .subscribe(carriers => {
          this.carriers = carriers;
          this.isLoadingCarriers = false;

          if (
            coerceNumberProperty(this.currentStatus) ===
            FinancialItemStatus.PartReceived
          ) {
            this.selectDefaultCarrier();
          }
        });
    }
  }

  private selectDefaultCarrier() {
    if (this.carriers && this.carriers.length > 0) {
      const defaultCarrier = this.carriers[0].carrierName;
      this.paidFormGroup().controls.carrierId.setValue(defaultCarrier);
    }
  }

  private performSanctionCheck(
    item: ClaimFinancialItemStatusChangeRequestDetail
  ) {
    this.queryInProgress = true;
    this.paymentRequestHttpService
      .PostClaimFinancialItemSanctionCheck(
        item.claimFinancialItemStatusHistoryDetail.claimFinancialItemId
      )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        result => {
          this.pendingPaymentRequest.sanctionsMatch = result.sanctionsMatch;

          if (result.sanctionsMatch) {
            this.submitButtonMessage = "Confirm";
            this.displayErrorMessage = true;
            this.messageErrorHandler.handleError(
              `Sanction Check Failed. Either 'Cancel', or click 'Confirm' to continue and save this status.`
            );
            this.queryInProgress = false;
          } else {
            this.submitButtonMessage = "Ok";
            this.saveStatusChange(item);
          }
        },
        err => {
          this.submitButtonMessage = "Confirm";
          this.displayErrorMessage = true;
          this.messageErrorHandler.handleError(
            `Unable to perform Sanction check at this time. Either 'Cancel', or click 'Confirm' to continue and save this status.`
          );
          this.queryInProgress = false;
        }
      );
  }

  private saveStatusChange(item: ClaimFinancialItemStatusChangeRequestDetail) {
    this.queryInProgress = true;
    this.paymentRequestHttpService
      .PostClaimFinancialItemStatusChange(item)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        x => {
          this.pendingPaymentRequest.itemStatusId = x.itemStatusId;
          this.pendingPaymentRequest.itemStatusName =
            FinancialItemStatus[x.itemStatusId];
          this.onCloseModal();
        },
        err => {
          this.displayErrorMessage = true;
          this.messageErrorHandler.handleError(
            `Unable to change status. ${err.error.Message}`
          );
          this.queryInProgress = false;
        }
      );
  }

  public bindDataForSubmit(data: {
    status: number;
    notes: string;
    paidGroup: any;
  }): ClaimFinancialItemStatusChangeRequestDetail {
    const item = new ClaimFinancialItemStatusChangeRequestDetail();
    item.claimFinancialItemStatusHistoryDetail = new ClaimFinancialItemStatusHistoryDetail();
    item.claimFinancialItemStatusHistoryDetail.notes = data.notes;
    item.claimFinancialItemStatusHistoryDetail.addedOn = new Date(Date.now());
    item.claimFinancialItemStatusHistoryDetail.claimFinancialItemStatusId = coerceNumberProperty(
      data.status
    );
    item.claimFinancialItemStatusHistoryDetail.claimFinancialItemId = coerceNumberProperty(
      this.pendingPaymentRequest.claimFinancialItemId
    );
    item.financialLedgerReference = this.pendingPaymentRequest.ledgerReference;
    // paid status parts
    if (data.paidGroup) {
      item.cfcBankAccountId = coerceNumberProperty(
        data.paidGroup.cfcBankAccountId
      );
      item.accountingReferenceDate = data.paidGroup.paidDate;
      item.bankAmount = data.paidGroup.accountAmount;
      item.carrier = data.paidGroup.carrierId;
      item.carrierOriginalAmount = data.paidGroup.originalAmount;
    }
    return item;
  }
}
