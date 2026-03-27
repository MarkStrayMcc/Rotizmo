import { Injectable } from "@angular/core";
import { Binder, BinderRatingEngineOutput, Coverage, CoverageRequest, CoverageType, PricingInformation, Quote, Tag } from "@app/models";
import { from, Observable } from "rxjs";
import { getTestQuote } from "test-helpers";

export let businessLine1: Tag;
export let businessLine2: Tag;
export let businessLine3: Tag;
export let coverageType1: CoverageType;
export let coverageType2: CoverageType;
export let coverageType3: CoverageType;
export let coverageType4: CoverageType;
export let coverage1: Coverage;
export let coverage2: Coverage;
export let coverage3: Coverage;
export let coverage4: Coverage;
export let quote: Quote;
export let pricingInfo1: PricingInformation;
export let pricingInfo2: PricingInformation;
export let pricingInfo3: PricingInformation;
export let pricingInfo4: PricingInformation;

export function setupTestData() {
    quote = getTestQuote();
    businessLine1 = {
        name: "XX",
        description: "Test Business Line 1"
    };

    businessLine2 = {
        name: "YY",
        description: "Test Business Line 2"
    };

    businessLine3 = {
        name: "TR",
        description: "Test Business Line Tria"
    };

    coverageType1 = {
        id: 1,
        name: "CoverageType 1",
        isMandatory: false,
        businessLine: businessLine1,
        insuringClauseCode: null,
        insuringClauseSectionCode: null,
        childCoverageTypes: [],
        limitTypes: [],
        excessTypes: [],
        isAdditionalCoverage: false,
        additionalCoverageCategories: null,
        order: 0
    } as CoverageType;

    coverageType2 = {
        id: 2,
        name: "CoverageType 2",
        isMandatory: false,
        businessLine: businessLine2,
        insuringClauseCode: null,
        insuringClauseSectionCode: null,
        childCoverageTypes: [],
        limitTypes: [],
        excessTypes: [],
        isAdditionalCoverage: false,
        additionalCoverageCategories: null,
        order: 1
    } as CoverageType;

    coverageType3 = {
        id: 1,
        name: "CoverageType 3",
        isMandatory: false,
        businessLine: businessLine1,
        insuringClauseCode: null,
        insuringClauseSectionCode: null,
        childCoverageTypes: [],
        limitTypes: [],
        excessTypes: [],
        isAdditionalCoverage: false,
        additionalCoverageCategories: null,
        order: 2
    } as CoverageType;

    coverageType4 = {
        id: 4,
        name: "CoverageType 4",
        isMandatory: false,
        businessLine: businessLine3,
        insuringClauseCode: null,
        insuringClauseSectionCode: null,
        childCoverageTypes: [],
        limitTypes: [],
        excessTypes: [],
        isAdditionalCoverage: true,
        additionalCoverageCategories: null,
        order: 3
    } as CoverageType;

    coverage1 = {
        coverageType: coverageType1,
        isExpanded: false,
        childCoverages: [
            {
                coverageType: coverageType1,
                isExpanded: false,
                childCoverages: null,
                limits: null,
                excesses: null
            }],
        limits: [],
        excesses: []
    };

    coverage2 = {
        coverageType: coverageType2,
        isExpanded: false,
        childCoverages: [
            {
                coverageType: coverageType2,
                isExpanded: false,
                childCoverages: null,
                limits: null,
                excesses: null
            }],
        limits: null,
        excesses: null
    };

    coverage3 = {
        coverageType: coverageType3,
        isExpanded: false,
        childCoverages: [
            {
                coverageType: coverageType3,
                isExpanded: false,
                childCoverages: null,
                limits: null,
                excesses: null
            }],
        limits: [],
        excesses: []
    };

    coverage4 = {
        coverageType: coverageType4,
        isExpanded: false,
        childCoverages: [
            {
                coverageType: coverageType4,
                isExpanded: false,
                childCoverages: null,
                limits: null,
                excesses: null
            }],
        limits: [],
        excesses: []
    };

    const binder = new Binder();
    binder.binderId = 1;
    binder.binderDescription = "Binder Test 1";

    pricingInfo1 = new PricingInformation();
    pricingInfo1.businessLine = businessLine1;
    pricingInfo1.model = 100;
    pricingInfo1.suggested = 100;
    pricingInfo1.quoted = 100;
    pricingInfo1.discount = 10;
    pricingInfo1.isExpanded = false;
    pricingInfo1.defaultFeePercentage = 10;
    pricingInfo1.fee = 0;
    pricingInfo1.binder = binder;

    pricingInfo2 = new PricingInformation();
    pricingInfo2.businessLine = businessLine2;
    pricingInfo2.model = 200;
    pricingInfo2.suggested = 180;
    pricingInfo2.quoted = 100;
    pricingInfo2.discount = 10;
    pricingInfo2.isExpanded = false;
    pricingInfo2.defaultFeePercentage = 10;
    pricingInfo2.fee = 0;
    pricingInfo2.binder = binder;

    pricingInfo3 = new PricingInformation();
    pricingInfo3.businessLine = businessLine1;
    pricingInfo3.model = 500;
    pricingInfo3.suggested = 300;
    pricingInfo3.quoted = 300;
    pricingInfo3.discount = 40;
    pricingInfo3.isExpanded = false;
    pricingInfo3.defaultFeePercentage = 10;
    pricingInfo3.fee = 0;
    pricingInfo3.binder = binder;

    pricingInfo4 = new PricingInformation();
    pricingInfo4.businessLine = businessLine3;
    pricingInfo4.model = 500;
    pricingInfo4.suggested = 300;
    pricingInfo4.quoted = 300;
    pricingInfo4.discount = 40;
    pricingInfo4.isExpanded = false;
    pricingInfo4.defaultFeePercentage = 10;
    pricingInfo4.fee = 0;
    pricingInfo4.binder = binder;
}

@Injectable()
export class MockPricingHttpService {
    public getDefaultPricingInformation(draftQuoteId: string): Observable<BinderRatingEngineOutput[]> {
        const binderRatingEngineOutput = new BinderRatingEngineOutput();
        binderRatingEngineOutput.pricingInformation = [pricingInfo1, pricingInfo2];
        binderRatingEngineOutput.binder = pricingInfo1.binder;
        binderRatingEngineOutput.locationOutputs = [
            {
                id: "1",
                modelPremium: 100,
                suggestedPremium: 100
            },
            {
                id: "2",
                modelPremium: 200,
                suggestedPremium: 180
            }
        ]

        const binderRatingEngineOutput2 = new BinderRatingEngineOutput();
        binderRatingEngineOutput2.pricingInformation = [pricingInfo3];
        binderRatingEngineOutput2.binder = pricingInfo3.binder;
        binderRatingEngineOutput2.locationOutputs = [
            {
                id: "3",
                modelPremium: 500,
                suggestedPremium: 300
            }
        ]

        const binderRatingEngineOutput3 = new BinderRatingEngineOutput();
        binderRatingEngineOutput3.pricingInformation = [pricingInfo4];
        binderRatingEngineOutput3.binder = pricingInfo4.binder
        binderRatingEngineOutput3.locationOutputs = null;

        return from([[binderRatingEngineOutput, binderRatingEngineOutput2, binderRatingEngineOutput3]]);
    }

    public getDefaultPricingInformationForSavedQuote(quote: Quote, hasAgreedPremium: boolean): Observable<BinderRatingEngineOutput[]> {
        const binderRatingEngineOutput = new BinderRatingEngineOutput();
        binderRatingEngineOutput.pricingInformation = [pricingInfo1, pricingInfo2];
        binderRatingEngineOutput.binder = pricingInfo1.binder;

        return from([[binderRatingEngineOutput]]);
    }
}

@Injectable()
export class MockCoverageHttpService {
    public getAvailable(model: CoverageRequest): Observable<CoverageType[]> {
        return from([[
            coverageType1,
            coverageType2,
            coverageType3,
            coverageType4
        ]]);
    }
}

@Injectable()
export class MockPremiumCalculationsService { }
