/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect, inject, fakeAsync } from "@angular/core/testing";
import { BrowserModule } from "@angular/platform-browser";
import { ChangeStatusModalComponent } from "@app/finance/change-status-modal/change-status-modal.component";
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MaterialModule } from "@app/material/material.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ErrorModule } from "@app/shared/error.module";
import {
  PaymentRequest,
  ClaimFinancialItemStatusChangeRequestDetail,
  CfcBankAccount,
  Currency,
  BinderSection,
  BinderSectionParticipation,
  Carrier
} from "@app/models";
import { FinancialItemStatus } from "@app/enums/FinancialItemStatus";
import { SimpleChange, LOCALE_ID, ChangeDetectorRef } from "@angular/core";
import { of, Observable} from "rxjs";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { MessageComponent } from "@app/components/message/message.component";
import { MessageService } from "@app/services/message.service";
import { PaymentRequestsHttpService } from "@app/services/payment-requests-http.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { Datepicker } from "@app/components/datepicker/datepicker.component";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { DropdownService } from "@app/services/dropdown.service";
import * as moment from "moment";
import { MomentDateAdapter, MOMENT_DATE_FORMATS } from "@app/providers/momentDateAdapter";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { PaidFormComponent } from "../paid-form/paid-form.component";
import { PartReceivedFormComponent } from "../part-received-form/part-received-form.component";
import { BinderSectionParticipationLookupService } from "../lookups/binder-section-participation-lookup.service";
import { BinderSectionParticipationHttpService } from "@app/services/binder-section-participation-http.service";

let component: ChangeStatusModalComponent;
let fixture: ComponentFixture<ChangeStatusModalComponent>;
let bankAccountService: CfcBankAccountService;
let bankAccountServiceSpy: jasmine.Spy;
let binderSectionParticipationLookupService: BinderSectionParticipationLookupService;
let binderSectionParticipationLookupServiceSpy: jasmine.Spy;
let dummyPendingRequest: PaymentRequest;

class MockMatDialogRef<T> {
    public close(dialogResult?: any): void { return; }
}

describe("change-status-modal component", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ChangeStatusModalComponent,
                MessageComponent,
                Datepicker,
                CurrencyComponent,
                LargeNumberMask,
                PaidFormComponent,
                PartReceivedFormComponent
            ],
            imports: [
                BrowserModule,
                FormsModule,
                MatDialogModule,
                MaterialModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                ErrorModule,
                HttpClientTestingModule
            ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                { provide: MatDialogRef, useClass: MockMatDialogRef },
                { provide: DateAdapter, useClass: MomentDateAdapter },
                { provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS },
                { provide: LOCALE_ID, useValue: "en-GB" },
                moment,
                FormBuilder,
                PaymentRequestsHttpService,
                CfcBankAccountService,
                ErrorMessageHandlerService,
                BinderSectionParticipationLookupService,
                BinderSectionParticipationHttpService,
                MessageService,
                ChangeDetectorRef
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(ChangeStatusModalComponent);
            component = fixture.componentInstance;
            bankAccountService = fixture.debugElement.injector.get(CfcBankAccountService);
            binderSectionParticipationLookupService = fixture.debugElement.injector.get(BinderSectionParticipationLookupService);
            let dummyCfcAccount = new CfcBankAccount();
            dummyCfcAccount.bankAccountCurrencyId = 2;
            dummyCfcAccount.cfcBankAccountId = 1;
            let dummyCfcAccount2 = new CfcBankAccount();
            dummyCfcAccount2.bankAccountCurrencyId = 3;
            dummyCfcAccount2.cfcBankAccountId = 2;
            let fakeResponse = of([dummyCfcAccount, dummyCfcAccount2]);
            bankAccountServiceSpy = spyOn(bankAccountService, "getBankAccounts").and.returnValue(fakeResponse);

            let fakeBinderSectionParticipation = new BinderSectionParticipation();
            fakeBinderSectionParticipation.carriers = [{ carrierName: "carrier", participationPercent: 1, syndicates: []}];
            let fakeCarriersResponse = of(fakeBinderSectionParticipation);
            binderSectionParticipationLookupServiceSpy = spyOn(binderSectionParticipationLookupService, "getData").and.returnValue(fakeCarriersResponse);

            let getSuggestedSpy = spyOn(bankAccountService, "getSuggestedAccount").and.returnValue(dummyCfcAccount);

            dummyPendingRequest = new PaymentRequest();
            dummyPendingRequest.itemStatusId = FinancialItemStatus.PendingApproval;
            dummyPendingRequest.claimFinancialItemId = 5;
            dummyPendingRequest.ledgerReference = "huzzah";
            dummyPendingRequest.amount = 5;
            dummyPendingRequest.currency = {
                isoCode: "GBP",
                symbol: "£",
                id: 1,
                name: "GBP",
                rate: 1.0
            };
            dummyPendingRequest.binderSection = new BinderSection();
            dummyPendingRequest.binderSection.binderDescription = "huzzah";
            dummyPendingRequest.binderSection.binderSectionDescription = "huzzah";
            dummyPendingRequest.binderSection.binderYear = "2066";
            component.pendingPaymentRequest = dummyPendingRequest;
        });
    }));

    it("should have a form created", async(() => {
        // arrange in constructor
        // act
        component.ngOnInit();

        // assert
        let form: FormGroup = component.statusForm;
        expect(form).not.toBeUndefined();
    }));

    it("should get the bank accounts on init", async(() => {
        // Arrange
        // Act
        component.ngOnInit();

        // assert
        expect(bankAccountServiceSpy).toHaveBeenCalled();
    }));

    it("should add the paidGroup form group if status changes to Paid", async(() => {
        // arrange
        component.ngOnInit();
        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Paid);

        // assert
        expect(component.statusForm.controls.paidGroup).not.toBeUndefined();
        expect(component.statusForm.controls.paidGroup).not.toBeNull();
    }));

    it("should remove the paidGroup form group if status changes from paid to something else", async(() => {
        // arrange
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Paid);
        component.statusForm.controls.status.setValue(FinancialItemStatus.PendingApproval);

        // assert
        expect(component.statusForm.controls.paidGroup).toBeUndefined();
    }));

    it("should find a suggested bank account when status changed to paid", fakeAsync(() => {
        // arrange
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Paid);

        // assert
        expect(component.suggestedAccountId).not.toBeNull();
        expect(component.paidFormGroup().controls.cfcBankAccountId.value).not.toBeNull();
    }));

    it("should set a currency based on the bank account selected", fakeAsync(() => {
        // arrange
        // currency id set in setup is 2
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Paid);

        // assert
        expect(component.paidFormGroup().controls.bankAccountCurrencyId.value).toBe(2);
    }));

    it("should set the selected currency based on the bank account selected", fakeAsync(() => {
        // arrange
        // currency id set in setup is 2
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Paid);

        // assert
        expect(component.selectedCurrency).not.toBeNull();
    }));

    it("should set the bank account amount based on the pending payment amount when changed to paid status.", async(() => {
        // arrange
        // paid amount is 5 in the setup
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Paid);

        // assert
        expect(component.paidFormGroup().controls.accountAmount.value).toBe(5);
    }));

    it("should set the bank account amount to zero when account changed when status is paid", async(() => {
        // arrange
        // currency id set in setup is 2
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Paid);
        component.paidFormGroup().controls.cfcBankAccountId.setValue(2);
        fixture.detectChanges();

        // assert
        expect(component.paidFormGroup().controls.accountAmount.value).toBe(0);
    }));

    it("should update the form value when the pending payment object is updated", async(() => {
        // arrange
        // act
        component.ngOnChanges({ pendingPaymentRequest: new SimpleChange(null, null, true) });

        // assert
        expect(component.statusForm.controls.status.value).toBe(FinancialItemStatus.PendingApproval);
    }));

    it("should add the paidGroup form group if status changes to Received", async(() => {
        // arrange
        component.ngOnInit();
        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Received);

        // assert
        expect(component.statusForm.controls.paidGroup).not.toBeUndefined();
        expect(component.statusForm.controls.paidGroup).not.toBeNull();
    }));

    it("should keep the paidGroup form group if status changes from paid to received", async(() => {
        // arrange
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Paid);
        component.statusForm.controls.status.setValue(FinancialItemStatus.Received);

        // assert
        expect(component.statusForm.controls.paidGroup).not.toBeUndefined();
    }));

    it("should remove the paidGroup form group if status changes from received to something else", async(() => {
        // arrange
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Received);
        component.statusForm.controls.status.setValue(FinancialItemStatus.PendingApproval);

        // assert
        expect(component.statusForm.controls.paidGroup).toBeUndefined();
    }));

    it("should find a suggested bank account when status changed to received", async(() => {
        // arrange
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Received);

        // assert
        expect(component.suggestedAccountId).not.toBeNull();
        expect(component.paidFormGroup().controls.cfcBankAccountId.value).not.toBeNull();
    }));

    it("should set the bank account amount to zero when account changed when status is received", async(() => {
        // arrange
        // currency id set in setup is 2
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Received);
        component.paidFormGroup().controls.cfcBankAccountId.setValue(2);
        fixture.detectChanges();

        // assert
        expect(component.paidFormGroup().controls.accountAmount.value).toBe(0);
    }));

    it("should set the bank account amount based on the pending payment amount when changed to received status.", async(() => {
        // arrange
        // paid amount is 5 in the setup
        component.ngOnInit();

        // act
        component.statusForm.controls.status.setValue(FinancialItemStatus.Received);

        // assert
        expect(component.paidFormGroup().controls.accountAmount.value).toBe(-5);
    }));

    it("should set data up when binding based on form and pending payment", async(() => {
        // arrange
        component.ngOnInit();

        // act
        let result = component.bindDataForSubmit({
            notes: "test",
            status: FinancialItemStatus.Paid,
            paidGroup: {
                cfcBankAccountId: 4,
                paidDate: "2010-01-01",
                accountAmount: 3.00,
                carrierId: "carrier"
            }
        });

        // assert
        expect(result.claimFinancialItemStatusHistoryDetail.addedOn).not.toBeNull();
        expect(result.claimFinancialItemStatusHistoryDetail.claimFinancialItemId).toBe(dummyPendingRequest.claimFinancialItemId);
        expect(result.claimFinancialItemStatusHistoryDetail.claimFinancialItemStatusId).toBe(FinancialItemStatus.Paid);
        expect(result.claimFinancialItemStatusHistoryDetail.notes).toBe("test");
        expect(result.financialLedgerReference).toBe(dummyPendingRequest.ledgerReference);
        expect(result.carrier).toBe("carrier");
        expect(result.bankAmount).toBe(3.00);
        expect(result.cfcBankAccountId).toBe(4);
    }));

    it("should set data up when binding based on form and pending payment for non paid status", async(() => {
        // arrange
        let dummyPendingRequest = new PaymentRequest();
        dummyPendingRequest.itemStatusId = FinancialItemStatus.Created;
        dummyPendingRequest.claimFinancialItemId = 5;
        dummyPendingRequest.ledgerReference = "huzzah";
        component.pendingPaymentRequest = dummyPendingRequest;

        component.ngOnInit();

        // act
        let result = component.bindDataForSubmit({
            notes: "test",
            status: FinancialItemStatus.Rejected,
            paidGroup: null
        });

        // assert
        expect(result.claimFinancialItemStatusHistoryDetail.addedOn).not.toBeNull();
        expect(result.claimFinancialItemStatusHistoryDetail.claimFinancialItemId).toBe(dummyPendingRequest.claimFinancialItemId);
        expect(result.claimFinancialItemStatusHistoryDetail.claimFinancialItemStatusId).toBe(FinancialItemStatus.Rejected);
        expect(result.claimFinancialItemStatusHistoryDetail.notes).toBe("test");
        expect(result.financialLedgerReference).toBe(dummyPendingRequest.ledgerReference);
        expect(result.cfcBankAccountId).toBeUndefined();
    }));
});
