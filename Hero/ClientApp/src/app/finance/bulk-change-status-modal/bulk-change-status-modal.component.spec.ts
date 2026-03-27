/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { LOCALE_ID } from "@angular/core";
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Datepicker } from "@app/components/datepicker/datepicker.component";
import { MessageComponent } from "@app/components/message/message.component";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { FinancialItemStatus } from "@app/enums/FinancialItemStatus";
import { BulkChangeStatusModalComponent } from "@app/finance/bulk-change-status-modal/bulk-change-status-modal.component";
import { MaterialModule } from "@app/material/material.module";
import {
    CfcBankAccount, ClaimFinancialItemStatusChangeRequestDetail, PaymentRequest
} from "@app/models";
import { MomentDateAdapter, MOMENT_DATE_FORMATS } from "@app/providers/momentDateAdapter";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { MessageService } from "@app/services/message.service";
import { PaymentRequestsHttpService } from "@app/services/payment-requests-http.service";
import { ErrorModule } from "@app/shared/error.module";
import * as moment from "moment";
import { of } from "rxjs";

let component: BulkChangeStatusModalComponent;
let fixture: ComponentFixture<BulkChangeStatusModalComponent>;
let bankAccountService: CfcBankAccountService;
let bankAccountServiceSpy: jasmine.Spy;
let dummyPendingRequests: PaymentRequest[];

class MockMatDialogRef<T> {
    public close(dialogResult?: any): void { return; }
}

describe("change-status-modal component", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                BulkChangeStatusModalComponent,
                MessageComponent,
                Datepicker,
                LargeNumberMask
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
                MessageService
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(BulkChangeStatusModalComponent);
            component = fixture.componentInstance;
            bankAccountService = fixture.debugElement.injector.get(CfcBankAccountService);
            let dummyCfcAccount = new CfcBankAccount();
            dummyCfcAccount.bankAccountCurrencyId = 2;
            dummyCfcAccount.cfcBankAccountId = 1;
            let dummyCfcAccount2 = new CfcBankAccount();
            dummyCfcAccount2.bankAccountCurrencyId = 3;
            dummyCfcAccount2.cfcBankAccountId = 2;
            let fakeResponse = of([dummyCfcAccount, dummyCfcAccount2]);
            bankAccountServiceSpy = spyOn(bankAccountService, "getBankAccounts").and.returnValue(fakeResponse);

            let getSuggestedSpy = spyOn(bankAccountService, "getSuggestedAccount").and.returnValue(dummyCfcAccount);


            let dummyPendingRequests = new Array<PaymentRequest>();

            let dummyPendingRequest = new PaymentRequest();
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
            dummyPendingRequests.push(dummyPendingRequest);

            component.pendingPaymentRequests = dummyPendingRequests;
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

    it("should call payment request http service and close when submitting form", async(() => {
        // arrange
        let paymentRequestHttpService = fixture.debugElement.injector.get(PaymentRequestsHttpService);
        let matDialogRef = fixture.debugElement.injector.get(MatDialogRef);
        let fakeResponse = of(new Array<ClaimFinancialItemStatusChangeRequestDetail>());

        let closeSpy = spyOn(matDialogRef, "close");
        let postSpy = spyOn(paymentRequestHttpService, "PostClaimFinancialItemStatusChanges").and.returnValue(fakeResponse);
        component.ngOnInit();

        // act
        component.onSubmit();

        // assert
        expect(postSpy).toHaveBeenCalled();
        expect(closeSpy).toHaveBeenCalled();
    }));

    it("should set data up when binding based on form and pending PAID", async(() => {
        // arrange
        component.ngOnInit();

        // act
        let result = component.bindDataForSubmit({
            notes: "test",
            status: FinancialItemStatus.Paid,
            paidGroup: {
                paidDate: "2010-01-01",
            }
        });

        // assert
        expect(result[0].claimFinancialItemStatusHistoryDetail.addedOn).not.toBeNull();
        expect(result[0].claimFinancialItemStatusHistoryDetail.claimFinancialItemStatusId).toBe(FinancialItemStatus.Paid);
        expect(result[0].claimFinancialItemStatusHistoryDetail.notes).toBe("test");
        expect(result[0].bankAmount).toBe(5);
        expect(result[0].cfcBankAccountId).toBe(1);
    }));


    it("should set data up when binding based on form and pending RECEIPT", async(() => {
        // arrange
        component.ngOnInit();

        // act
        let result = component.bindDataForSubmit({
            notes: "test",
            status: FinancialItemStatus.Received,
            paidGroup: {
                paidDate: "2010-01-01",
            }
        });

        // assert
        expect(result[0].claimFinancialItemStatusHistoryDetail.claimFinancialItemStatusId).toBe(FinancialItemStatus.Received);
        expect(result[0].bankAmount).toBe(-5.00);
    }));

});
