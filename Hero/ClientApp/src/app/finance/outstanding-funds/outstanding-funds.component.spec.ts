import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { OutstandingFundsComponent } from "./outstanding-funds.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CfcBankAccountService } from "@app/services/cfc-bank-account.service";
import { ConfigService } from "@app/services/config.service";
import { LedgerReferenceHttpService } from "@app/services/ledger-reference-http.service";
import { OutstandingFundsHttpService } from "@app/services/finance/outstanding-funds/outstanding-funds-http.service";
import { OutstandingFundsGridDataHandlerService } from "@app/services/finance/outstanding-funds/outstanding-funds-grid-data-handler.service";
import { OutstandingFundsFormComponent } from "./outstanding-funds-form/outstanding-funds-form.component";
import { OutstandingFundsGridComponent } from "./outstanding-funds-grid/outstanding-funds-grid.component";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { MaterialModule } from "@app/material/material.module";
import { ErrorModule } from "@app/shared/error.module";
import { AgGridModule } from "ag-grid-angular";
import { FinanceNumberDisplayComponent } from "@app/ag-grid/finance-number-display/finance-number-display.component";
import { GridHeaderComponent } from "@app/ag-grid/grid-header/grid-header.component";
import { AgGridComponentsModule } from "@app/ag-grid/AgGridComponentsModule.module";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Title } from "@angular/platform-browser";
import { MatDialogModule } from "@angular/material";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { DropdownService } from "@app/services/dropdown.service";
import { BinderSectionParticipationLookupService } from "@finance/lookups/binder-section-participation-lookup.service";

xdescribe("OutstandingFundsComponent", () => {
  let component: OutstandingFundsComponent;
  let fixture: ComponentFixture<OutstandingFundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [
            OutstandingFundsComponent,
            AutocompleteDropdown, // required by funds form
            OutstandingFundsFormComponent,
            OutstandingFundsGridComponent
        ],
        imports: [
            ReactiveFormsModule,    // required for binding forms to formGroup
            MaterialModule, // required for the matAutocomplete used by autocomplete dropdown
            BrowserAnimationsModule, // without this you get an error asking you to include this
            ErrorModule, // required by error component
            // ag grid components required to render the OFGridComponent
            AgGridModule.withComponents([
                FinanceNumberDisplayComponent,
                GridHeaderComponent,
            ]),
            AgGridComponentsModule,
            HttpClientTestingModule,
            MatDialogModule
        ],
        providers: [
            AppCommunicationService,
            FormBuilder,
            CfcBankAccountService,  // because ofundgriddatahandler service needs this
            ConfigService,  // because ledgerreferencehttpservice depends on it
            LedgerReferenceHttpService, // because ofundgriddatahandler service needs this
            OutstandingFundsHttpService, // because ofundgriddatahandler service needs this
            OutstandingFundsGridDataHandlerService,
            Title,
            ModalDialogService,
            CurrencyHttpService,
            DropdownService,
            BinderSectionParticipationLookupService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
