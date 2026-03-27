/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from "@angular/core/testing";
import { BrowserModule, By, Title } from "@angular/platform-browser";
import { PaymentRequestsComponent } from "@app/finance/payment-requests/payment-requests.component";
import { FormsModule, ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { CommonModule, DecimalPipe } from "@angular/common";
import { FinancialItemStatus, PaymentRequest } from "@app/models";
import { AgGridModule } from "ag-grid-angular";
import { CustomPinnedRowRenderer } from "@app/finance/ledger/custom-pinned-row-renderer.component";
import { MatDialogModule } from "@angular/material/dialog";
import { MaterialModule } from "@app/material/material.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { PaymentRequestsHttpService } from "@app/services/payment-requests-http.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { ConfigService } from "@app/services/config.service";
import { FinanceModule } from "@app/finance/finance.module";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { AgGridComponentsModule } from "@app/ag-grid/AgGridComponentsModule.module";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { BinderSectionParticipationLookupService } from "../lookups/binder-section-participation-lookup.service";
import { BinderSectionParticipationHttpService } from "@app/services/binder-section-participation-http.service";
import { MessageComponent } from "@app/components/message/message.component";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";

let component: PaymentRequestsComponent;
let fixture: ComponentFixture<PaymentRequestsComponent>;

function getTestPaymentRequest(itemStatus: FinancialItemStatus): PaymentRequest {
    const paymentRequest: PaymentRequest = {
        ecfReconciliationId: 1,
        accountingReferenceDateFormattedString: "01/01/2000",
        claimFinancialItemId: 1,
        amount: 100,
        accountingReferenceDate: null,
        currency: null,
        classification: null,
        itemStatusId: itemStatus,
        itemStatusName: "",
        financialType: "Payment",
        paymentType: "Cash Call",
        payeeName: "John Smith",
        sanctionsMatch: false,
        claimId: 1,
        claimReference: "abc",
        policyId: 1,
        cfcTeamId: "CFC USA",
        client: null,
        ledgerReference: "defg",
        lloydsRiskCode: "AB",
        binderSection: null
    };
    return paymentRequest;
}

xdescribe("payment-requests component", () => {

    class MockErrorMessageHandlerService { }

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                MessageComponent,
                PaymentRequestsComponent
            ],
            imports: [
                FormsModule,
                CommonModule,
                HttpClientTestingModule,
                AgGridComponentsModule,
                AgGridModule.withComponents([
                    CustomPinnedRowRenderer,
                    GridHeaderComponent
                ]),
                MatDialogModule,
                MaterialModule,
                BrowserAnimationsModule,
                ReactiveFormsModule
            ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                BinderSectionParticipationLookupService,
                BinderSectionParticipationHttpService,
                PaymentRequestsHttpService,
                AppCommunicationService,
                FormBuilder,
                LedgerReferenceHttpService,
                ModalDialogService,
                Title,
                ConfigService,
                DecimalPipe,
                { provide: ErrorMessageHandlerService, useClass: MockErrorMessageHandlerService },
            ]
        });
        fixture = TestBed.createComponent(PaymentRequestsComponent);
        component = fixture.componentInstance;
    }));

    // Will be expanded more in future
    it("should do something", async(() => {
        expect(true).toEqual(true);
    }));

    it("should set up event for status column clicks", async(() => {
        // act
        const columns = component.paymentRequestsGridColumns;

        // assert
        const columnWithEvent = columns.find((column) => {
            return column.field === "itemStatusId";
        });

        expect(columnWithEvent.onCellClicked).not.toBeNull();
        expect(columnWithEvent.onCellClicked).not.toBeUndefined();
    }));

    it("should open the modal when a status cell is clicked if not a paid status", async(() => {
        // arrange
        const modalDialogService = fixture.debugElement.injector.get(ModalDialogService);
        const modalSpy = spyOn(modalDialogService, "openDialog");

        const paymentRequest = getTestPaymentRequest(FinancialItemStatus.PendingApproval);
        const params = { api: null, data: paymentRequest };

        // act
        component.openSingleChangeStatusDialog(component, params);

        // assert
        expect(modalSpy).toHaveBeenCalled();
    }));

    it("should not open the modal when a status cell is clicked if a paid status", async(() => {
        // arrange
        const modalDialogService = fixture.debugElement.injector.get(ModalDialogService);
        const modalSpy = spyOn(modalDialogService, "openDialog");

        const paymentRequest = getTestPaymentRequest(FinancialItemStatus.Paid);
        const params = { api: null, data: paymentRequest };

        // act
        component.openSingleChangeStatusDialog(component, params);

        // assert
        expect(modalSpy).toHaveBeenCalledTimes(0);
    }));
});

