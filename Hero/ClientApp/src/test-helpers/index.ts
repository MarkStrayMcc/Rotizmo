import { DebugElement } from "@angular/core";
import { ComponentFixture, tick } from "@angular/core/testing";
import {
    Quote,
    ClientLocation,
    QuoteState,
    BrokerTeam,
    RiskQuestionAnswer,
    InsuranceBasis,
    BinderValidationCriteria
} from "@app/models";
import { RiskQuestionType } from "@app/enums/RiskQuestionType";
import * as Models from "@app/models/RiskQuestionAnswer";
import {CommissionInformation} from "@app/quote/models/pricing/CommissionInformation";

export function advance(f: ComponentFixture<any>): void {
    tick();
    f.detectChanges();
}

/**
 * Create custom DOM event the old fashioned way
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Event/initEvent
 * Although officially deprecated, some browsers (phantom) don't accept the preferred "new Event(eventName)"
 */
export function newEvent(eventName: string, bubbles = false, cancelable = false) {
    const evt = document.createEvent("CustomEvent");  // MUST be 'CustomEvent'
    evt.initCustomEvent(eventName, bubbles, cancelable, null);
    return evt;
}

// See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export const ButtonClickEvents = {
    left: { button: 0 },
    right: { button: 2 },
};

/** Simulate element click. Defaults to mouse left-button click event. */
export function click(el: DebugElement | HTMLElement, eventObj: any = ButtonClickEvents.left): void {
    if (el instanceof HTMLElement) {
        el.click();
    } else {
        el.triggerEventHandler("click", eventObj);
    }
}

export function getTestQuote(): Quote {
    const now = new Date();

    const quote = new Quote();
    quote.quoteReference = 0;
    quote.draftQuoteId = "4e73f08b-6466-4699-826c-e0ad71196d4a";
    quote.client = {
        uid: "4e73f08b-6466-4699-826c-e0ad71196d4a",
        id: 62854,
        companyName: "LG Squared Inc",
        headquartersCountry:
        {
            countryId: 1,
            name: "UK",
            isoCode: "GB",
            currency: {
                id: 3,
                name: "United Kingdom Pounds",
                isoCode: "GBP",
                symbol: "£",
                rate: 1.0
            },
        },
        primaryLocation: {
            clientLocationId: 308697,
            clientId: 62854,
            address1: "7 ashfield grove",
            address2: "",
            address3: "",
            city: "bradford",
            countryId: 1,
            postcode: "bd9998toio",
            isPrimaryLocation: true,
            stateProvinceCode: "",
            county: "west yorkshire",
            disabledOn: null,
            country: {
                countryId: 1,
                name: "UK",
                isoCode: "GB",
                currency: {
                    id: 3,
                    name: "United Kingdom Pounds",
                    isoCode: "GBP",
                    symbol: "£",
                    rate: 1.0
                },
            },
        },
        hasEuSubsidiaries: false
    };
    quote.brokerTeam = new BrokerTeam();
    quote.brokerTeam.id = 1;
    quote.brokerTeam.name = "asd";
    quote.brokerTeam.broker = {
        brokerId: 1,
        city: "test city",
        country: {
            countryId: 1,
            name: "UK",
            isoCode: "GB",
            currency: {
                id: 3,
                name: "United Kingdom Pounds",
                isoCode: "GBP",
                symbol: "£",
                rate: 1.0
            },
        },
        tobA_Signed: true,
        companyName: "My Broker TEST (Sfdadtistan, Somewhere)",
        disabledOn: null,
        brokerGroupId: 123
    };

    quote.brokerContact = {
        id: 16296,
        title: "Mr",
        firstName: "Albert",
        lastName: "Geraci",
        email: "Albert_Geraci@rpsins.com",
    };
    quote.brokerGroup = {
        brokerGroupId: 16296,
        brokerGroupName: "Amwins Brokerage of Georgia, Inc.",
    };
    quote.insuranceTypeId = 2;
    quote.insuranceType = "Fac Re – Standard";
    quote.assignedContactId = 242;
    quote.currencyId = 3;
    quote.address = null;
    quote.inceptionDate = now;
    quote.policyPeriod = 12;
    quote.expiryDate = now;
    quote.languageId = 0;
    quote.commissionInformation = {
        brokerFee: null,
        fee: null,
        actualGrossCommission: null,
        cfcShare: null,
        originalGrossCommission: null
    };
    quote.nerdVersion = 3;
    quote.wordingVersionId = 3;
    quote.assignedContact = {
        cfcContactUid: "4e73f08b-6466-4699-826c-e0ad71196d4b",
        cfcContactId: 242,
        name: "Harneet  Bains",
        profileImageUrl: "img/staff/empty_profile.png",
        firstName: "Bains",
        lastName: "Harneet",
        initials: "HZB",
        email: "hbains@cfcunderwriting.com",
        cfcTeamName: "Healthcare US",
        accessLevel: 10,
        active: true,
        roles: [],
        position: "",
        linkedInUrl: "",
        telephone: "",
        accessibleFeatures: [],
        cfcTeamCoverholder: "CFC Underwriting",
    };
    quote.clientLocationId = 308697;
    quote.clientLocation = <ClientLocation>{
        clientLocationId: 308697,
        clientId: 62854,
        address1: "7 ashfield grove",
        address2: "",
        address3: "",
        city: "bradford",
        countryId: 1,
        postcode: "bd9998toio",
        isPrimaryLocation: true,
        stateProvinceCode: "",
        county: "west yorkshire",
        disabledOn: null,
        country: {
            countryId: 1,
            name: "UK",
            isoCode: "GB",
            currency: {
                id: 3,
                name: "United Kingdom Pounds",
                isoCode: "GBP",
                symbol: "£",
            },
        },
    };
    quote.currency = {
        id: 3,
        name: "United Kingdom Pounds",
        isoCode: "GBP",
        symbol: "£",
        rate: 1.0
    };
    quote.product = {
        productId: 1,
        productName: "Management Liability",
        productDisplay: "",
        enabledOnNewQuotePage: true,
        nerdVersion: 3,
        isAdmitted: false,
        productUid: "6E9EB55F-7A21-4D7C-9D32-99A4A3277D5F"

    };
    quote.activities = [];
    quote.descriptionOfBusiness = "";
    quote.subjectivities = [];
    quote.coverages = [];
    quote.insuredLocation = <ClientLocation>{
        clientLocationId: 444333,
        clientId: 62854,
        address1: "72 ashfield grove",
        address2: "",
        address3: "",
        city: "bradford",
        countryId: 1,
        postcode: "HA48HK",
        isPrimaryLocation: true,
        stateProvinceCode: "",
        county: "west yorkshire",
        disabledOn: null,
        country: {
            countryId: 1,
            name: "UK",
            isoCode: "GB",
            currency: {
                id: 3,
                name: "United Kingdom Pounds",
                isoCode: "GBP",
                symbol: "£",
                rate: 1.0
            },
        },
    };
    quote.propSignedDate = null;
    quote.endorsements = [];
    quote.autoAttachedEndorsements = [];
    quote.removedAutoAttachEndorsements = [];
    quote.riskQuestionAnswers = [
        new RiskQuestionAnswer(
            0,
            0,
            "TOTAL_REVENUE",
            null,
            null,
            null,
            null,
            10000000,
            null,
            0,
            8
        ),
        new RiskQuestionAnswer(
            0,
            0,
            "GST_Registered",
            "No",
            null,
            null,
            null,
            null,
            "543f6cbe-e0fa-4785-9744-ad377b53e92e",
            0,
            3
        )
    ];
    quote.defaultSubjectivities = [];
    quote.removedDefaultSubjectivities = [];
    quote.premium = 150;
    quote.taxRate = Number(0.10);
    quote.totalDue = 172;
    quote.pricingInformation = [];
    quote.state = QuoteState.InProgress;
    quote.quoteType = "NB";
    quote.enquiryId = 1;
    quote.enquiryUid = '3B3A7FC5-A227-4EDC-A85F-5DC43B2CC887';
    quote.expiringPolicyNumber = "1";
    quote.createdByUnderwriter = "PJW";
    quote.reAutoSelectAllCoverages = true;
    quote.quoteType = "RN";
    quote.insuranceBasis = InsuranceBasis.Primary;
    quote.binderValidationCriteria = {};
    return quote;
}

export function getTestBinderValidationCriteria(): { [businessCategoryTagName: string]: BinderValidationCriteria; } {
    const criterias: { [businessCategoryTagName: string]: BinderValidationCriteria } = {};
    criterias["CP"] = {
        binderSectionId: 1030,
        maxRevenue: null,
        maxLimit: 10000000,
        maxFee: 500000,
        usMinExposure: 0,
        usMaxExposure: 1
    };
    criterias["CX"] = {
        binderSectionId: 1030,
        maxRevenue: null,
        maxLimit: 10000000,
        maxFee: 500000,
        usMinExposure: 0,
        usMaxExposure: 1
    };
    return criterias;
}
export const pricingInfo1 = [
    {
        "businessLine": {
            "name": "CP",
            "description": null
        },
        "model": 500,
        "suggested": 1000,
        "minimumPremium": 500,
        "quoted": 1000,
        "discount": -100,
        "isExpanded": true,
        "defaultFeePercentage": 10,
        "fee": 0,
        "binder": {
            "binderId": 233,
            "binderDescription": "SME Cyber",
            "isEuBinder": false
        },
        "binderSectionId": 717,
        "isSelectedLine": true,
        "ratingEngineVersionId": 553,
        "suggestedDiscount": 0
    },
    {
        "businessLine": {
            "name": "CX",
            "description": null
        },
        "model": 59,
        "suggested": 780,
        "minimumPremium": 29,
        "quoted": 780,
        "discount": -1222.0338983050847,
        "isExpanded": true,
        "defaultFeePercentage": 10,
        "fee": 0,
        "binder": {
            "binderId": 233,
            "binderDescription": "SME Cyber",
            "isEuBinder": false
        },
        "binderSectionId": 717,
        "isSelectedLine": true,
        "ratingEngineVersionId": 553,
        "suggestedDiscount": 0
    }
];


export const pricingInfo2 = [
    {
        "businessLine": {
            "name": "CP",
            "description": null
        },
        "model": 500,
        "suggested": 1000,
        "minimumPremium": 500,
        "quoted": 1000,
        "discount": -100,
        "isExpanded": true,
        "defaultFeePercentage": 10,
        "fee": 0,
        "binder": {
            "binderId": 233,
            "binderDescription": "SME Cyber",
            "isEuBinder": false
        },
        "binderSectionId": 717,
        "isSelectedLine": true,
        "ratingEngineVersionId": 553,
        "suggestedDiscount": 0
    },
    {
        "businessLine": {
            "name": "CX",
            "description": null
        },
        "model": 59,
        "suggested": 780,
        "minimumPremium": 29,
        "quoted": 780,
        "discount": -1222.0338983050847,
        "isExpanded": true,
        "defaultFeePercentage": 10,
        "fee": 0,
        "binder": {
            "binderId": 233,
            "binderDescription": "SME Cyber",
            "isEuBinder": false
        },
        "binderSectionId": 717,
        "isSelectedLine": true,
        "ratingEngineVersionId": 553,
        "suggestedDiscount": 0
    }
];

export function addRevenue(quote: Quote, revenueLastYear: number, revenuePercentageUsLastYear: number) {
    if (!quote.riskQuestionAnswers || quote.riskQuestionAnswers.findIndex(riskQuestionAnswer => riskQuestionAnswer.riskQuestionTag === "TOTAL_REVENUE") >= 0) {
        quote.riskQuestionAnswers = [];
    }

    const revenueAnswer = new RiskQuestionAnswer(
        1,
        quote.quoteReference,
        "TOTAL_REVENUE",
        null,
        null,
        null,
        null,
        revenueLastYear,
        null,
        4,
        RiskQuestionType.currency
    );

    quote.riskQuestionAnswers.push(revenueAnswer);

    const usPercentage: RiskQuestionAnswer = new RiskQuestionAnswer(
        2,
        quote.quoteReference,
        "US_PERCENT",
        null,
        null,
        revenuePercentageUsLastYear,
        null,
        null,
        null,
        4,
        RiskQuestionType.percentage);

    quote.riskQuestionAnswers.push(usPercentage);
}

export let mockQuoteComponent = {
    vm: getTestQuote(),
    stepBasicInfo: 1,
    stepCoverages: 2,
    stepActivities: 3,
    stepRisk: 4,
    stepSubjectivities: 5,
    stepEndorsements: 6,
    stepPricing: 7,
    setVisitedTab(step: number): void {
    },
    hasBeenVisitedTab(step: number): boolean {
        return false;
    },
    removedDefaultSubjectivities: new Array<number>(),
};
