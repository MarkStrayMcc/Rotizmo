/* tslint:disable:max-classes-per-file */
import { DecimalPipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { inject, TestBed } from "@angular/core/testing";
import {Observable, from, of} from "rxjs";
import { getTestBinderValidationCriteria, getTestQuote} from "../../test-helpers/index";
import { BinderValidationCriteria, Quote, QuoteState, Tag} from "@app/models";
import { BinderValidationHttpService } from "@app/services/binder-validation-http.service";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { PricingService } from "@app/quote/services/pricing-service";

describe("BinderValidationService - Integration", () => {
    let binderValidationHttpService: BinderValidationHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: BinderValidationHttpService,
                    useClass: MockBinderValidationHttpService
                },
                {
                    provide: PricingService,
                    useClass: MockPricingService
                },
                BinderValidationService,
                DecimalPipe
            ]
        }).compileComponents();

        binderValidationHttpService = TestBed.inject(BinderValidationHttpService);
    });

    it("Should be created", inject([BinderValidationService],
        (binderValidationService: BinderValidationService) => {
            expect(binderValidationService).toBeTruthy();
        })
    );

    describe("Quote is in progress", () => {
        const testDraftQuoteId = "Quote:abc123";
        const testBusinessLineCodes = "DO,CL,MD";
        let pricingService: PricingService;
        let pricingServiceSpy: jasmine.Spy;
        let binderValidationService: BinderValidationService;
        let quote: Quote;

        beforeEach(inject([BinderValidationService, PricingService],
            (bs: BinderValidationService, ps: PricingService) => {
                binderValidationService = bs;
                pricingService = ps;
                pricingServiceSpy = spyOn(pricingService, "getBusinessLines").and.callThrough();
                quote = getTestQuote();
                quote.state = QuoteState.InProgress;
                criteria = getCriteria();
            }
        ));

        it("When we initialiseBindersCriteriaValidation with no matching binder sections then the binderValidationCriteria should be the section with the greatest maxRevenue", () => {
            // Arrange

            // Act
            binderValidationService.loadBinderValidationCriterias(quote.draftQuoteId, "CP,CX");
            binderValidationService.initialiseBindersCriteriaValidation(quote);

            // Assert
            expect(quote.binderValidationCriteria["CP"].binderSectionId).toEqual(1);
            expect(quote.binderValidationCriteria["CP"].maxRevenue).toEqual(101);
            expect(quote.binderValidationCriteria["CX"].binderSectionId).toEqual(12);
            expect(quote.binderValidationCriteria["CX"].maxRevenue).toEqual(104);
        });

        it("When we initialiseBindersCriteriaValidation with a null maxRevenue then the binderValidationCriteria should be the binder section with the null maxRevenue", () => {
            // Arrange
            criteria["CP"][0].maxRevenue = null;
            criteria["CX"][0].maxRevenue = null;

            // Act
            binderValidationService.loadBinderValidationCriterias(quote.draftQuoteId, "CP,CX");
            binderValidationService.initialiseBindersCriteriaValidation(quote);

            // Assert
            expect(quote.binderValidationCriteria["CP"].binderSectionId).toEqual(0);
            expect(quote.binderValidationCriteria["CP"].maxRevenue).toEqual(null);
            expect(quote.binderValidationCriteria["CX"].binderSectionId).toEqual(10);
            expect(quote.binderValidationCriteria["CX"].maxRevenue).toEqual(null);
        });

        it("When we initialiseBindersCriteriaValidation with a maxRevenue greater than the revenue then the binderValidationCriteria should be the binder section with maxRevenue greater than the revenue", () => {
            // Arrange
            criteria["CP"][1].maxRevenue = 20000000;
            criteria["CX"][1].maxRevenue = 30000000;

            // Act
            binderValidationService.loadBinderValidationCriterias(quote.draftQuoteId, "CP,CX");
            binderValidationService.initialiseBindersCriteriaValidation(quote);

            // Assert
            expect(quote.binderValidationCriteria["CP"].binderSectionId).toEqual(1);
            expect(quote.binderValidationCriteria["CP"].maxRevenue).toEqual(20000000);
            expect(quote.binderValidationCriteria["CX"].binderSectionId).toEqual(11);
            expect(quote.binderValidationCriteria["CX"].maxRevenue).toEqual(30000000);
        });

        it("When we initialiseBindersCriteriaValidation with only some matching maxRevenue criteria then we select the lowest usMinExposure of the filtered binder sections", () => {
            // Arrange
            criteria["CP"][0].maxRevenue = null;
            criteria["CP"][0].usMinExposure = 0.2;
            criteria["CP"][0].usMaxExposure = 0.9;
            criteria["CP"][1].maxRevenue = null;
            criteria["CP"][1].usMinExposure = 0.3;
            criteria["CP"][1].usMaxExposure = 0.9;
            criteria["CX"][0].maxRevenue = null;
            criteria["CX"][0].usMinExposure = 0.3;
            criteria["CX"][1].maxRevenue = null;
            criteria["CX"][1].usMinExposure = 0.2;

            // Even those have a bigger exposure, they won't be selected because the maxRevenue is not enough
            criteria["CP"][2].maxRevenue = 10;
            criteria["CP"][2].usMinExposure = 0.01;
            criteria["CX"][2].maxRevenue = 10;
            criteria["CX"][2].usMinExposure = 0.01;


            // Act
            binderValidationService.loadBinderValidationCriterias(quote.draftQuoteId, "CP,CX");
            binderValidationService.initialiseBindersCriteriaValidation(quote);

            // Assert
            expect(quote.binderValidationCriteria["CP"].binderSectionId).toEqual(0);
            expect(quote.binderValidationCriteria["CP"].usMinExposure).toEqual(0.2);
            expect(quote.binderValidationCriteria["CX"].binderSectionId).toEqual(11);
            expect(quote.binderValidationCriteria["CX"].usMinExposure).toEqual(0.2);
        });

        // I don't think this is right, we're actively going for the lowest max if the min is the same
        it("When we initialiseBindersCriteriaValidation with only some matching maxRevenue criteria then we select the lowest usMaxExposure of the filtered binder sections", () => {
            // Arrange
            criteria["CP"][0].maxRevenue = null;
            criteria["CP"][0].usMinExposure = 0.2;
            criteria["CP"][0].usMaxExposure = 0.9;
            criteria["CP"][1].maxRevenue = null;
            criteria["CP"][1].usMinExposure = 0.2;
            criteria["CP"][1].usMaxExposure = 0.8;

            // Even those have a bigger exposure, they won't be selected because the maxRevenue is not enough
            criteria["CP"][2].maxRevenue = 10;
            criteria["CP"][2].usMinExposure = 0.01;
            criteria["CP"][2].usMaxExposure = 0.99;

            // Act
            binderValidationService.loadBinderValidationCriterias(quote.draftQuoteId, "CP,CX");
            binderValidationService.initialiseBindersCriteriaValidation(quote);

            // Assert
            expect(quote.binderValidationCriteria["CP"].binderSectionId).toEqual(1);
            expect(quote.binderValidationCriteria["CP"].usMaxExposure).toEqual(0.8);
        });

        it("When we initialiseBindersCriteriaValidation with only some matching maxRevenue criteria then we select the lowest min even if we have a higher range of US Exposure of the filtered binder sections", () => {
            // Arrange
            criteria["CP"][0].maxRevenue = null;
            criteria["CP"][0].usMinExposure = 0.2;
            criteria["CP"][0].usMaxExposure = 0.5;
            criteria["CP"][1].maxRevenue = null;
            criteria["CP"][1].usMinExposure = 0.3;
            criteria["CP"][1].usMaxExposure = 0.9;

            // Act
            binderValidationService.loadBinderValidationCriterias(quote.draftQuoteId, "CP,CX");
            binderValidationService.initialiseBindersCriteriaValidation(quote);

            // Assert
            expect(quote.binderValidationCriteria["CP"].binderSectionId).toEqual(0);
            expect(quote.binderValidationCriteria["CP"].usMinExposure).toEqual(0.2);
            expect(quote.binderValidationCriteria["CP"].usMaxExposure).toEqual(0.5);
        });

        // I don't think this is right, we're getting one that in not in the range of the US_PERCENT
        it("When we initialiseBindersCriteriaValidation with only some matching maxRevenue criteria then we select the one that is in the range of the US_PERCENT", () => {
            // Arrange
            quote.riskQuestionAnswers["US_PERCENT"] = 0.7;
            criteria["CP"][0].maxRevenue = null;
            criteria["CP"][0].usMinExposure = 0.2;
            criteria["CP"][0].usMaxExposure = 0.5;
            criteria["CP"][1].maxRevenue = null;
            criteria["CP"][1].usMinExposure = 0.3;
            criteria["CP"][1].usMaxExposure = 0.9;

            // Act
            binderValidationService.loadBinderValidationCriterias(quote.draftQuoteId, "CP,CX");
            binderValidationService.initialiseBindersCriteriaValidation(quote);

            // Assert
            expect(quote.binderValidationCriteria["CP"].binderSectionId).toEqual(0);
            expect(quote.binderValidationCriteria["CP"].usMinExposure).toEqual(0.2);
            expect(quote.binderValidationCriteria["CP"].usMaxExposure).toEqual(0.5);
        });

    });
});

@Injectable()
class MockBinderValidationHttpService {
    public getBinderValidationCriterias(draftQuoteId: string, businessLineCodes: string): Observable<{ [businessCategoryTagName: string]: BinderValidationCriteria[] }> {
        return from([criteria]);
    }
}
let criteria = getCriteria();

export function getCriteria(): { [businessCategoryTagName: string]: BinderValidationCriteria[] }
{
    return {
        CP: [
            {
                binderSectionId: 0,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 100,
                usMaxExposure: 0.6,
                usMinExposure: 0.25
            },
            {
                binderSectionId: 1,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 101,
                usMaxExposure: 0.5,
                usMinExposure: 0.2
            },
            {
                binderSectionId: 2,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 90,
                usMaxExposure: 0.3,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 3,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 89,
                usMaxExposure: 0.5,
                usMinExposure: 0.3
            }] as BinderValidationCriteria[],
        CX: [
            {
                binderSectionId: 10,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 102,
                usMaxExposure: 0.3,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 11,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 103,
                usMaxExposure: 0.4,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 12,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 104,
                usMaxExposure: 0.5,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 13,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 103,
                usMaxExposure: 0.5,
                usMinExposure: 0.1
            }
        ] as BinderValidationCriteria[],
        MD: [
            {binderSectionId: 20}
        ] as BinderValidationCriteria[]
    };
}

@Injectable()
class MockPricingService {
    private businessLine1 = {
        name: "CP",
        description: "Test Business Line 1"
    } as Tag;

    private businessLine2 = {
        name: "CX",
        description: "Test Business Line 2"
    } as Tag;

    public getBusinessLines(quote: Quote): Tag[] {
        return [this.businessLine1, this.businessLine2];
    }
}



