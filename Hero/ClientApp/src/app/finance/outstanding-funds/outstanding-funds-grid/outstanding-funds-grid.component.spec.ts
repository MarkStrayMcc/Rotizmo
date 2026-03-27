import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { OutstandingFundsGridComponent } from "./outstanding-funds-grid.component";
import { AgGridComponentsModule } from "@app/ag-grid/AgGridComponentsModule.module";
import { AgGridModule } from "ag-grid-angular";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { OutstandingFundsGridDataHandlerService } from "@app/services/finance/outstanding-funds/outstanding-funds-grid-data-handler.service";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { OutstandingFundsHttpService } from "@app/services/finance/outstanding-funds/outstanding-funds-http.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ConfigService } from "@app/services/config.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { MatDialogModule } from "@angular/material";
import { MaterialModule } from "@app/material/material.module";
import { ReactiveFormsModule } from "@angular/forms";
import {
    OutstandingFundAddTransactionModalService
} from "@app/services/finance/add-transaction-modal/modal-service/outstanding-fund-add-transaction-modal-service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";
import { BinderSectionParticipationHttpService } from "@app/services/binder-section-participation-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { UserService } from "@app/services/user.service";
import { CookieService } from "ngx-cookie-service";

class MockErrorMessageHandlerService {
    public handleError(error): void { return; }
    public handleWarning(warning): void { return; }
    public handleErrorsByStatusCode(error, statusCode): void { return; }
}

describe("OutstandingFundsGridComponent", () => {
    let component: OutstandingFundsGridComponent;
    let fixture: ComponentFixture<OutstandingFundsGridComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OutstandingFundsGridComponent],
            imports: [
                AgGridModule.withComponents([
                    FinanceNumberDisplayComponent,
                    GridHeaderComponent,
                ]),
                AgGridComponentsModule,
                HttpClientTestingModule,
                MatDialogModule,
                MaterialModule,
                ReactiveFormsModule
            ],
            providers: [
                CfcBankAccountService,  // because ofundgriddatahandler service needs this
                ConfigService,  // because ledgerreferencehttpservice depends on it
                LedgerReferenceHttpService, // because ofundgriddatahandler service needs this
                OutstandingFundsHttpService, // because ofundgriddatahandler service needs this
                OutstandingFundsGridDataHandlerService,
                ModalDialogService,
                OutstandingFundAddTransactionModalService,
                CurrencyHttpService,
                DropdownService,
                BinderSectionParticipationLookupService,
                BinderSectionParticipationHttpService,
                UserService,
                CookieService, // this is required by the UserService
                { provide: ErrorMessageHandlerService, useClass: MockErrorMessageHandlerService }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OutstandingFundsGridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
