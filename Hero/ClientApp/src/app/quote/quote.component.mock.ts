import { Quote } from "@angular/compiler";
import { mockCfcContact } from "@app/mocks/cfc-contact.mock";
import { ActivityDetail, CfcContact, Client, Currency, FeatureAccess, PricingInformation, QuotePublishRequest } from "@app/models";
import { environment } from "environments/environment";
import { from, Observable, of } from "rxjs";
import { getTestQuote } from "test-helpers";
import { QuoteAction } from "./models/QuoteAction";

export class MockModalDialogService {
    public openDialog<T, TY>(obj) { return; }
}

export class MockMatDialog { }

export class MockNavigationoverride { }

export class MockMatDialogRef<T> {
    public close(dialogResult?: any): void { return; }
}

export class MockWarningService {
    public hasWarning(): boolean {
        return false;
    }
}

export class MockFeaturesHttpService {
    public isFeatureActive(): Observable<FeatureAccess> {

        const featureAccessDto = {
            featureName: "publishQuoteButton",
            hasAccess: true
        } as FeatureAccess;

        return of(featureAccessDto);
    }
}

export class MockClientFolderService {
    public getClientFolder() { return of("testFolderPath"); }
}

export class MockQuoteHttpService {
    public publishQuote(quotePublishRequest: QuotePublishRequest): Observable<boolean> {
        return of(true);
    }
}

export class MockQuoteService {
    public quote = of(getTestQuote());
    public getCurrency(): Currency {
        return { isoCode: "USD", rate: 1 } as Currency;
    }
    public propertyChanged: Observable<QuoteAction>;
    public setQuote(quote: Quote, isOriginalQuote: boolean): void { }
    public updateQuote = () => { }
    public setPropertyValue = () => { }
    public getQuoteReference() {
        return getTestQuote();
    }
    public getOriginalQuote() {
        return getTestQuote();
    }
    public getActivities(): ActivityDetail[] {
        return getTestQuote().activities;
    }
    public getQuoteProperty$ = () => of(mockClientLocation)
    public getHasBlastZoneCapacity = () => false;
}

export const mockCountry = {
    countryId: 1,
    name: "UK",
    isoCode: "GB",
    currency: {
        "id": 3,
        "name": "United Kingdom Pounds",
        "isoCode": "GBP",
        "symbol": "£",
        "rate": 1
    }
}

export const mockClientLocation = {
    clientLocationId: 1042433,
    clientId: 784364,
    address1: "5807 South Woodlawn Avenue",
    address2: "",
    address3: "",
    city: "Chicago",
    countryId: 4,
    postcode: "60637",
    isPrimaryLocation: true,
    stateProvinceCode: "MI",
    county: "Cook County",
    disabledOn: null,
    country: {
        countryId: 4,
        name: "US",
        isoCode: "US",
        currency: {
            id: 2,
            name: "United States Dollars",
            isoCode: "USD",
            symbol: "$",
            rate: 1.128715
        }
    }
}

export const mockClient: Client = {
    id: 784364,
    uid: "8a379213-0900-4367-981c-df86d97ae4aa",
    companyName: "Amaiz Ltd",
    headquartersCountry: mockCountry,
    primaryLocation: mockClientLocation,
    hasEuSubsidiaries: false
}

export const mockChangeDetectorRef = {}

export class MockEnquiryHttpService {
    public getEnquiryById() {
        return of(null);
    }
}

export class MockTaxHttpService {
    public getGSTRate = () => from([0.1]);
}

export class MockPremiumCalculationsService {
    public resetFees = () => { };
    public calculateTotalFee = () => { };
    public calculateFeeSplit = () => { };
    public premiumUpdateHandler = () => { };
}

export const mockActivatedRoute = {
    snapshot: {
        queryParams: {
            template: "quote"
        }
    }
}

export class MockRouter {
    public navigate = () => null;
}

export const mockModalDialogService = {
    openDialog: jasmine.createSpy()
}

export const mockUserProfile = mockCfcContact;

export const mockUserService = {
    getData(): Observable<CfcContact> { return of(mockUserProfile); },
    getUser(): CfcContact {
        return mockUserProfile;
    },
    isFeatureAccessible(): boolean { return true },
    getInitials(): string { return mockUserProfile.initials }
}

export class MockBinderValidationService {
    public filterBindersCriteriaBasedOnRevenueFirst(): void { return; }
    public loadCriteriasForSelectedBusinessCategoriesOnQuote(): void { return; }
    public loadCriteriasForSelectedBusinessCategories(): void { return; }
    public getBinderValidationWarningMessages(): void { return; }
    public generateBinderValidationWarningsForTab(): void { return; }
}

export class MockErrorMessageHandlerService {
    public handleError(error): void { return; }
    public handleWarning(warning): void { return; }
}

export const mockMessageService = {
    clearMessage: jasmine.createSpy(),
    clearAllMessages: jasmine.createSpy(),
    sendMessage: jasmine.createSpy(),
    getMessage: () => { }
}

export class MockEnquiryValidationService {
    public ValidateHeroEnquiry(): boolean { return true; }
}

export const mockConfigService = {
    nerdUrl: environment.api.nerdUrl
}

export const mockNavigationOverrideService = {
    allowNavigation: true
}

export class MockPricingService {
    public isCalculating: boolean = false;
    public updateBusinesLines(quote: Quote): void { }
    public getPricingInformation(quote: Quote): Observable<PricingInformation[]> {
        return from([[]]);
    }
    public getBusinessLines(quote: Quote, withAdditionalCoverages: boolean = false) {
        return from([]);
    }
    public getProRatedPricingInformation = () => { };
}

export class MockUnderwriterDiscountAuthorityService {
    public getMaxDiscountPercentage(): number { return 10; }
}

export class MockUnderwriterActivityValidationService {
    public doActivityDetailsHaveWarning(activities: ActivityDetail[]): boolean { return true; }
}

export class MockUnderwriterRiskValidationService {
    public isValidRiskQuestionAnswer = () => true;
    public hasValidRiskAnswers = () => true;
    public isValidNumberSplitByActivity = () => true;
}

export class MockUnderwriterCoverageAuthorityService {
    public isBoundQuote = () => true;
    public isApprovedQuote = () => true;
    public setWarningStatus = (key: string, hasWarningStatus: boolean) => "";
}

export class MockTaxService {
    public isGSTRateAvailable = () => true;
    public useGST = () => false;
    public getGST = () => 0.1;
}

export class MockWordingVersionHttpService {
    public getWordingVersions(params: any) { return of([]); }
}

export class MockClientClearanceService {
    public checkClientClearanceForBroker = () => { }
}
