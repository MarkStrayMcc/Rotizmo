Installing a temporary version to perform the update.
Installing packages for tooling via npm.
Installed packages for tooling via npm.
Using package manager: 'npm'
Collecting installed dependencies...
Found 58 dependencies.
Fetching dependency metadata from registry...
                  Package "@angular/http" has an incompatible peer dependency to "@angular/core" (requires "7.2.16" (extended), would install "9.1.13").
                  Package "@angular/http" has an incompatible peer dependency to "@angular/platform-browser" (requires "7.2.16" (extended), would install "9.1.13").
    Updating package.json with dependency @angular-devkit/build-angular @ "0.901.15" (was "0.803.29")...
    Updating package.json with dependency @angular/cli @ "9.1.15" (was "9.1.13")...
    Updating package.json with dependency @angular/compiler-cli @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency @angular/language-service @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency typescript @ "3.8.3" (was "3.5.3")...
    Updating package.json with dependency @angular/animations @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency @angular/common @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency @angular/compiler @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency @angular/core @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency @angular/forms @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency @angular/platform-browser @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency @angular/platform-browser-dynamic @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency @angular/router @ "9.1.13" (was "8.2.14")...
    Updating package.json with dependency zone.js @ "0.10.3" (was "0.9.1")...
  UPDATE package.json (2942 bytes)
✔ Packages successfully installed.
** Executing migrations of package '@angular/core' **

> Static flag migration.
  Removes the `static` flag from dynamic queries.
  As of Angular 9, the "static" flag defaults to false and is no longer required for your view and content queries.
  Read more about this here: https://v9.angular.io/guide/migration-dynamic-flag
  UPDATE src/app/finance/ecf-reconciliation-summary/ecf-reconciliation-summary.component.ts (33420 bytes)
  UPDATE src/app/finance/ecf-reconciliation-financial-trans/ecf-reconciliation-financial-trans.component.ts (27969 bytes)
  UPDATE src/app/finance/ecf-reconciliation-claim-financial-items/ecf-reconciliation-claim-financial-items.component.ts (26934 bytes)
  UPDATE src/app/finance/loss-fund-summary/loss-fund-summary.component.ts (3632 bytes)
  UPDATE src/app/finance/payment-requests/payment-requests.component.ts (16664 bytes)
  UPDATE src/app/components/autocomplete-multiselect/autocomplete-multiselect.component.ts (5215 bytes)
  UPDATE src/app/components/datepicker/datepicker.component.ts (3787 bytes)
  UPDATE src/app/components/slider/currency-slider.component.ts (6561 bytes)
  UPDATE src/app/finance/outstanding-funds/outstanding-funds-grid/outstanding-funds-grid.component.ts (11354 bytes)
  UPDATE src/app/quote/popups/bind-quote-modal/bind-quote-modal.component.ts (16032 bytes)
  UPDATE src/app/quote/popups/send-email-modal/send-email-modal.component.ts (12821 bytes)
  UPDATE src/app/quote/components/activities/activity-list/activity-list.component.ts (10694 bytes)
  UPDATE src/app/quote/steps/activities-step/activities-step.component.ts (4673 bytes)
  UPDATE src/app/quote/popups/client-manageaddress-modal.component.ts (17329 bytes)
  UPDATE src/app/quote/steps/basic-information-step/basic-information-step.component.ts (39839 bytes)
  UPDATE src/app/shared/additional-insured/additional-insured.component.ts (6650 bytes)
  UPDATE src/app/quote/popups/quote-additional-insured-modal/quote-additional-insured.component.ts (2280 bytes)
  UPDATE src/app/shared/loss-payee/loss-payee.component.ts (6618 bytes)
  UPDATE src/app/quote/popups/quote-loss-payee-modal/quote-loss-payee.component.ts (2068 bytes)
  UPDATE src/app/quote/steps/endorsements-step/endorsements-step.component.ts (29567 bytes)
  UPDATE src/app/quote/steps/subjectivities-step/subjectivities-step.component.ts (18216 bytes)
  UPDATE src/app/quote/quote.component.ts (47158 bytes)
  UPDATE src/app/quote/components/coverage/excess/excess.component.ts (5312 bytes)
  UPDATE src/app/quote/basic-information/basic-information-view/basic-information-view.component.ts (20314 bytes)
  UPDATE src/app/policy/mta/popups/address-change/mta-address-change.component.ts (11497 bytes)
  UPDATE src/app/policy/mta/popups/loss-payee/mta-loss-payee.component.ts (7804 bytes)
  UPDATE src/app/shared/modals/confirmation-modal/confirmation-modal.component.ts (3384 bytes)
  UPDATE src/app/policy/mta/popups/additional-insured/mta-additional-insured.component.ts (8369 bytes)
  UPDATE src/app/policy/mta/popups/cancellation/mta-cancellation.component.ts (16597 bytes)
  UPDATE src/app/policy/mta/popups/client-name-change/mta-client-name-change.component.ts (11835 bytes)
  UPDATE src/app/policy/mta/popups/manual-mta/mta-manual-mta.component.ts (10741 bytes)
  UPDATE src/app/bulk-quoting/bulk-quoting.component.ts (572 bytes)
  UPDATE src/app/bulk-quoting/components/file-upload/file-upload/file-upload.component.ts (5235 bytes)
  UPDATE src/app/policy/mta/popups/address-change/mta-address-change.component.spec.ts (4609 bytes)
  UPDATE src/app/quote/popups/client-address-modal.component.spec.ts (6790 bytes)
  UPDATE src/app/quote/popups/client-manageaddress-modal.component.spec.ts (10041 bytes)
  UPDATE src/app/quote/popups/selector-modals/product-selector-modal/product-selector-modal.component.spec.ts (8148 bytes)
  UPDATE src/app/quote/popups/underwriter-notes-modal/underwriter-notes-modal.component.spec.ts (9003 bytes)
  Migration completed.

> Missing @Injectable and incomplete provider definition migration.
  In Angular 9, enforcement of @Injectable decorators for DI is a bit stricter and incomplete provider definitions behave differently.
  Read more about this here: https://v9.angular.io/guide/migration-injectable
  UPDATE src/app/providers/momentDateAdapter.ts (7428 bytes)
  UPDATE src/app/shared/services/form-creator.service.ts (1245 bytes)
  UPDATE src/app/shared/services/dropdown-field.service.ts (395 bytes)
  UPDATE src/app/quote/components/risk/risk-form-validation-handler/risk-question-validation-handler.ts (772 bytes)
  Migration completed.

> ModuleWithProviders migration.
  In Angular 9, the ModuleWithProviders type without a generic has been deprecated.
  This migration adds the generic where it is missing.
  Read more about this here: https://v9.angular.io/guide/migration-module-with-providers
  Migration completed.

> Renderer to Renderer2 migration.
  As of Angular 9, the Renderer class is no longer available.
  Renderer2 should be used instead.
  Read more about this here: https://v9.angular.io/guide/migration-renderer
  Migration completed.

> Undecorated classes with decorated fields migration.
  As of Angular 9, it is no longer supported to have Angular field decorators on a class that does not have an Angular decorator.
  Read more about this here: https://v9.angular.io/guide/migration-undecorated-classes
  UPDATE src/app/ag-grid/base-grid-filter-input/base-grid-filter-input.component.ts (1330 bytes)
  UPDATE src/app/quote/steps/base-step.component.ts (2456 bytes)
  UPDATE src/app/shared/additional-insured/additional-insured.component.ts (6674 bytes)
  UPDATE src/app/shared/loss-payee/loss-payee.component.ts (6642 bytes)
  UPDATE src/app/quote/components/risk/base-risk-question/base-risk-question-value-accessor.component.ts (1673 bytes)
  Migration completed.

> Undecorated classes with DI migration.
  As of Angular 9, it is no longer supported to use Angular DI on a class that does not have an Angular decorator.
  Read more about this here: https://v9.angular.io/guide/migration-undecorated-classes
    
    This migration uses the Angular compiler internally and therefore projects that no longer build successfully after the update cannot run the migration. Please ensure there are no AOT compilation errors and rerun the migration. The following project failed: tsconfig.app.json
    
    Error: error TS100: src\app\basic-information-store\reducers\basic-information.reducer.ts(6,25): Error during template compile of 'reducers'
      Function calls are not supported in decorators but 'combineReducers' was called.
    error TS100: Invalid provider for the NgModule 'QuoteModule in C:/repos/hero/Hero/ClientApp/src/app/quote/quote.module.ts' - only instances of Provider and Type are allowed, got: [ActivityService in 
C:/repos/hero/Hero/ClientApp/src/app/quote/services/activity.service.ts, CoverageService in C:/repos/hero/Hero/ClientApp/src/app/services/coverage.service.ts, CoverageItemService in C:/repos/hero/Hero/ClientApp/src/app/services/coverage-item.service.ts, RiskService in C:/repos/hero/Hero/ClientApp/src/app/services/risk-service.ts, QuoteService in C:/repos/hero/Hero/ClientApp/src/app/quote/services/quote.service.ts, LanguageService in C:/repos/hero/Hero/ClientApp/src/app/quote/services/language.service.ts, LanguageHttpService in C:/repos/hero/Hero/ClientApp/src/app/quote/services/language-http.service.ts, RiskHttpService in C:/repos/hero/Hero/ClientApp/src/app/services/risk-http.service.ts, CfcContactHttpService in C:/repos/hero/Hero/ClientApp/src/app/services/cfc-contact-http.service.ts, ProductHttpService in C:/repos/hero/Hero/ClientApp/src/app/services/product-http.service.ts, QuoteSubjectivityService in C:/repos/hero/Hero/ClientApp/src/app/services/quote-subjectivity.service.ts, BinderValidationService in C:/repos/hero/Hero/ClientApp/src/app/services/binder-validation.service.ts, EnquiryValidationService in C:/repos/hero/Hero/ClientApp/src/app/services/enquiry-validation.service.ts, ?null?, ...]  
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: src\app\routeguards\CaseInsensitiveMatcher.ts(50,12): Error during template compile of 'caseInsensitiveMatcher'
      Function expressions are not supported in decorators
        Consider changing the function expression into an exported function.
    error TS100: Cannot determine the module for class MockSharedFormCreatorComponent in C:/repos/hero/Hero/ClientApp/src/app/compliance/mocks/send-eu-documents.mocks.ts! Add MockSharedFormCreatorComponent to the NgModule to fix it.
    Cannot determine the module for class ByteFormatPipe in C:/repos/hero/Hero/ClientApp/src/app/components/input-file/byte-format.pipe.ts! Add ByteFormatPipe to the NgModule to fix it.
    Cannot determine the module for class MockErrorComponent in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockErrorComponent to the NgModule to fix it.
    Cannot determine the module for class MockDatePickerComponent in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockDatePickerComponent to the NgModule to fix it.
    Cannot determine the module for class MockCurrencyComponent in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockCurrencyComponent to the NgModule to fix it.
    Cannot determine the module for class MockMessageComponent in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockMessageComponent to the NgModule to fix it.
    Cannot determine the module for class MockLoadingSpinnerComponent in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockLoadingSpinnerComponent to the NgModule to fix it.        
    Cannot determine the module for class MockCarrierContributionsComponent in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockCarrierContributionsComponent to the NgModule to fix it.
    Cannot determine the module for class MockLargeNumberMask in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockLargeNumberMask to the NgModule to fix it.
    Cannot determine the module for class MockAutocompleteDropdown in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockAutocompleteDropdown to the NgModule to fix it.
    Cannot determine the module for class MockTagInputComponent in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockTagInputComponent to the NgModule to fix it.
    Cannot determine the module for class MockPercentageInputComponent in C:/repos/hero/Hero/ClientApp/src/app/mocks/components.mocks.ts! Add MockPercentageInputComponent to the NgModule to fix it.      
    Cannot determine the module for class MockSharedFormCreatorComponent in C:/repos/hero/Hero/ClientApp/src/app/policy/mocks/mta.mocks.ts! Add MockSharedFormCreatorComponent to the NgModule to fix it.  
    Cannot determine the module for class MockAutocompleteDropdown in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockAutocompleteDropdown to the NgModule to fix it.    Cannot determine the module for class MockDatePicker in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockDatePicker to the NgModule to fix it.
    Cannot determine the module for class MockCoverageComponent in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockCoverageComponent to the NgModule to fix it.      
    Cannot determine the module for class MockActivityListComponent in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockActivityListComponent to the NgModule to fix it.
    Cannot determine the module for class MockCurrencyComponent in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockCurrencyComponent to the NgModule to fix it.      
    Cannot determine the module for class MockMatProgressSpinner in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockMatProgressSpinner to the NgModule to fix it.    
    Cannot determine the module for class MockBusinessCategoryPricingComponent in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockBusinessCategoryPricingComponent to the NgModule to fix it.
    Cannot determine the module for class MockCommissionPricing in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockCommissionPricing to the NgModule to fix it.      
    Cannot determine the module for class MockRiskPanelComponent in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockRiskPanelComponent to the NgModule to fix it.    
    Cannot determine the module for class MockSurplusLineSelectorComponent in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockSurplusLineSelectorComponent to the NgModule to fix it.
    Cannot determine the module for class MockValueArray in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/base-step.component.mock.ts! Add MockValueArray to the NgModule to fix it.
    Cannot determine the module for class MockBusinessCategoryPricingComponent in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/pricing-step/pricing-step.component.mock.ts! Add MockBusinessCategoryPricingComponent to the NgModule to fix it.
 the NgModule to fix it.
    Cannot determine the module for class MockCurrencyComponent in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/pricing-step/pricing-step.component.mock.ts! Add MockCurrencyComponent to the NgModule 
to fix it.
    Cannot determine the module for class MockLargeNumberMask in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/pricing-step/pricing-step.component.mock.ts! Add MockLargeNumberMask to the NgModule to fix it.
    Cannot determine the module for class MockNumberOnly in C:/repos/hero/Hero/ClientApp/src/app/quote/steps/pricing-step/pricing-step.component.mock.ts! Add MockNumberOnly to the NgModule to fix it.    
    Cannot determine the module for class MockMessageComponent in C:/repos/hero/Hero/ClientApp/src/app/shared/form-creator/form-creator.component.mock.ts! Add MockMessageComponent to the NgModule to fix 
it.
    Cannot determine the module for class MockFormFieldRendererComponent in C:/repos/hero/Hero/ClientApp/src/app/shared/form-creator/form-creator.component.mock.ts! Add MockFormFieldRendererComponent to 
the NgModule to fix it.
    Cannot determine the module for class MockMatspinnerComponent in C:/repos/hero/Hero/ClientApp/src/app/shared/form-creator/form-creator.component.mock.ts! Add MockMatspinnerComponent to the NgModule to fix it.
    Cannot determine the module for class MockMatSpinner in C:/repos/hero/Hero/ClientApp/src/app/test/matProgressSpinner.mock.ts! Add MockMatSpinner to the NgModule to fix it.
    
    
    Could not migrate all undecorated classes that use dependency
    injection. Some project targets could not be analyzed due to
    TypeScript program failures.

    Migration can be rerun with: "ng update @angular/core --migrate-only migration-v9-undecorated-classes-with-di"

  Migration completed.