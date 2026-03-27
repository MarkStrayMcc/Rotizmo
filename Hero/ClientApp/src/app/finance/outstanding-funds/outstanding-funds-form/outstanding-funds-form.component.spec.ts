import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { OutstandingFundsFormComponent } from "./outstanding-funds-form.component";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { ErrorModule } from "@app/shared/error.module";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { MaterialModule } from "@app/material/material.module";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { ConfigService } from "@app/services/config.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { OutstandingFundsHttpService } from "@app/services/finance/outstanding-funds/outstanding-funds-http.service";
import { OutstandingFundsGridDataHandlerService } from "@app/services/finance/outstanding-funds/outstanding-funds-grid-data-handler.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { UserService } from "@app/services/user.service";
import { CookieService } from "ngx-cookie-service";

class MockErrorMessageHandlerService {
    public handleError(error): void { return; }
    public handleWarning(warning): void { return; }
    public handleErrorsByStatusCode(error, statusCode): void { return; }
}

describe("OutstandingFundsFormComponent", () => {
    let component: OutstandingFundsFormComponent;
    let fixture: ComponentFixture<OutstandingFundsFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                OutstandingFundsFormComponent,
                AutocompleteDropdown    // the ledger reference dropdown is an autocomplete dropdown
            ],
            imports: [
                ReactiveFormsModule,    // required for binding forms to formGroup
                MaterialModule, // required for the matAutocomplete used by autocomplete dropdown
                BrowserAnimationsModule, // without this you get an error asking you to include this
                ErrorModule, // required by error component
                HttpClientTestingModule
            ],
            providers: [
                FormBuilder,
                CfcBankAccountService,  // because ofundgriddatahandler service needs this
                ConfigService,  // because ledgerreferencehttpservice depends on it
                LedgerReferenceHttpService, // because ofundgriddatahandler service needs this
                OutstandingFundsHttpService, // because ofundgriddatahandler service needs this
                OutstandingFundsGridDataHandlerService,
                UserService,
                CookieService, // this is required by the UserService
                { provide: ErrorMessageHandlerService, useClass: MockErrorMessageHandlerService }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OutstandingFundsFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
