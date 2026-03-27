import { AgmCoreModule } from "@agm/core";
import { CdkTableModule } from "@angular/cdk/table";
import { APP_BASE_HREF, CommonModule, DatePipe } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { MAT_LABEL_GLOBAL_OPTIONS, MAT_RIPPLE_GLOBAL_OPTIONS } from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ComplianceModule } from "@app/compliance/compliance.module";
import { AppComponent } from "@app/components/app/app.component";
import { MenuBarComponent } from "@app/components/menu-bar/menu-bar.component";
import { UserProfileComponent } from "@app/components/user-profile/user-profile.component";
import { FinanceModule } from "@app/finance/finance.module";
import { PolicyModule } from "@app/policy/policy.module";
import { QuoteModule } from "@app/quote/quote.module";
import { EnquiryService } from "@app/quote/services/enquiry.service";
import { SubjectivityHttpService } from "@app/quote/services/subjectivity/subjectivity-http.service";
import { FeatureAccessGuard } from "@app/routeguards/can-activate-guard/feature-access.guard";
import { BinderValidationHttpService } from "@app/services/binder-validation-http.service";
import { BrokerContactHttpService } from "@app/services/broker-contact-http-service";
import { CfcContactHttpService } from "@app/services/cfc-contact-http.service";
import { CfcContactPersonalMessageHttpService } from "@app/services/cfc-contact-personal-message-http.service";
import { ClientNoteHttpService } from "@app/services/clientnote-http.service";
import { CombineDiscountPricingService } from "@app/services/combine-discount-pricing.service";
import { ConfigService } from "@app/services/config.service";
import { CoverageHttpService } from "@app/services/coverage-http.service";
import { DocumentHttpService } from "@app/services/document-http.service";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { EmailContactService } from "@app/services/email-contact.service";
import { EmailHttpService } from "@app/services/email-http.service";
import { EnquiryHttpService } from "@app/services/enquiry-http-service";
import { FeaturesHttpService } from "@app/services/features-http.service";
import { LocationHttpService } from "@app/services/location-http.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { PricingGroupService } from "@app/services/pricing-group.service";
import { PricingHttpService } from "@app/services/pricing-http-service";
import { QuoteHttpService } from "@app/services/quote-http.service";
import { TaxHttpService } from "@app/services/tax-http.service";
import { TriaHttpService } from "@app/services/tria-http.service";
import { UserService } from "@app/services/user.service";
import { SharedModule } from "@app/shared/shared.module";
import { UnauthorisedComponent } from "@app/unauthorised/unauthorised.component";
import { CookieService } from "ngx-cookie-service";
import { AppRoutingModule } from "./app-routing.module";
import { BulkQuotingModule } from "./bulk-quoting/bulk-quoting.module";
import { SubjectivityService } from "./quote/services/subjectivity/subjectivity.service";
import { RootStoreModule } from "./root-store/root-store.module";
import { ErrorHandlerService } from "./services/error-handling.service";
import { PolicyEmailHttpService } from "./services/policy-email-http.service";
import { QuoteEmailHttpService } from "./services/quote-email-http.service";
import { BlastZoneHttpService } from './services/blast-zone-http.service';
import { CoverageCalculationService } from "@app/services/coverage-calculation.service";
import { UnderwritingDistributionService } from './services/underwriting-distribution.service';
import { RequestEnrichmentHttpService } from './services/request-enrichment-http.service';

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        UserProfileComponent,
        MenuBarComponent,
        UnauthorisedComponent
    ],
    imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        SharedModule,
        RootStoreModule,
        CdkTableModule,
        QuoteModule,
        FinanceModule,
        BulkQuotingModule,
        CommonModule,
        AppRoutingModule,
        PolicyModule,
        ComplianceModule,
        AgmCoreModule.forRoot({
            apiKey: "AIzaSyChNp06eEHRfycsxMmU1GHL7kyfSjoToC8",
            libraries: ["places"],
        })
    ],
    providers: [
        { provide: "ORIGIN_URL", useValue: location.origin },
        { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: "never" } },
        {
            provide: MAT_RIPPLE_GLOBAL_OPTIONS,
            useValue: { disabled: true, animation: { enterDuration: 450 } }
        },
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: ErrorHandler, useClass: ErrorHandlerService },
        DropdownService,
        QuoteHttpService,
        DocumentHttpService,
        LocationHttpService,
        ConfigService,
        MatDialog,
        AgmCoreModule,
        SubjectivityService,
        SubjectivityHttpService,
        CoverageHttpService,
        ClientNoteHttpService,
        DropDownManagerService,
        CfcContactHttpService,
        EnquiryHttpService,
        EnquiryService,
        TaxHttpService,
        TriaHttpService,
        EmailHttpService,
        EmailContactService,
        PricingHttpService,
        UserService,
        BinderValidationHttpService,
        CfcContactPersonalMessageHttpService,
        NavigationOverrideService,
        FeatureAccessGuard,
        FeaturesHttpService,
        CombineDiscountPricingService,
        PricingGroupService,
        CookieService,
        QuoteEmailHttpService,
        PolicyEmailHttpService,
        BrokerContactHttpService,
        BlastZoneHttpService,
        CoverageCalculationService,
        UnderwritingDistributionService,
        DatePipe,
        RequestEnrichmentHttpService
    ]
})
export class AppModule { }
