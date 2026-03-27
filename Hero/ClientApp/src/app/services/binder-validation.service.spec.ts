/* tslint:disable:max-classes-per-file */
import { DecimalPipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { inject, TestBed } from "@angular/core/testing";
import { QuoteConfig } from "@app/quote/quote.config";
import { Observable, from } from "rxjs";
import { addRevenue, getTestQuote } from "../../test-helpers/index";
import {BinderValidationCriteria, CoverageType, Quote, QuoteState, Tag} from "@app/models";
import { BinderValidationHttpService } from "@app/services/binder-validation-http.service";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { PricingService } from "@app/quote/services/pricing-service";

describe("BinderValidationService", () => {
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
        spyOn(binderValidationHttpService, "getBinderValidationCriterias").and.callThrough();
    });

    it("Should be created", inject([BinderValidationService],
        (binderValidationService: BinderValidationService) => {
            expect(binderValidationService).toBeTruthy();
        }));

    it("Should call HTTP service once to load binder validation criterias", inject([BinderValidationService],
        (binderValidationService: BinderValidationService) => {
            // Actors
            const testDraftQuoteId = "Quote:abc123";
            const testBusinessLineCodes = "DO,CL,MD";

            // Actions
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);

            // Asserts
            expect(binderValidationHttpService.getBinderValidationCriterias).toHaveBeenCalledTimes(1);
            expect(binderValidationHttpService.getBinderValidationCriterias).toHaveBeenCalledWith(testDraftQuoteId, testBusinessLineCodes);
        }));

    it("Should return binder validation criterias once loaded for a given draft quote ID",
        inject([BinderValidationService], (binderValidationService: BinderValidationService) => {
            // Actors
            const testDraftQuoteId = "Quote:abc123";
            const testBusinessLineCodes = "DO,CL,MD";

            // Actions
            const criteriasInitial = binderValidationService.binderValidationCriterias;
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);
            const criteriasFinal = binderValidationService.binderValidationCriterias;

            // Asserts
            expect(criteriasInitial).toBeDefined();
            expect(Object.keys(criteriasInitial).length).toBe(0);
            expect(criteriasFinal).toBeDefined();
            expect(Object.keys(criteriasFinal).length).toBe(3);
            expect(criteriasFinal.CL).toBeDefined();
            expect(criteriasFinal.CL.length).toBe(4);
            expect(criteriasFinal.CL[0].binderSectionId).toBe(2);
            expect(criteriasFinal.CL[1].binderSectionId).toBe(1);
        }));

    describe("Risk binder validation", () => {
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
            }
        ));

        it("Should return binder validation criteria for the selected business categories", () => {
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const selectedBinderValidationCriteria = binderValidationService.selectedBusinessCategoriesCriterias;

            expect(selectedBinderValidationCriteria).toBeDefined();
            expect(selectedBinderValidationCriteria.hasOwnProperty("DO")).toBeTruthy();
            expect(selectedBinderValidationCriteria.hasOwnProperty("CL")).toBeTruthy();
            expect(selectedBinderValidationCriteria.hasOwnProperty("MD")).toBeFalsy();
        });

        it("Should return binder validation criteria when maxRevenue is null", () => {
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);
            quote.binderValidationCriteria = null;
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);

            const selectedBinderValidationCriteria = binderValidationService.selectedBusinessCategoriesCriterias;
            quote.binderValidationCriteria = null;
            binderValidationService.binderValidationCriterias.DO[0].maxRevenue = null;
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);

            expect(selectedBinderValidationCriteria).toBeDefined();
            expect(selectedBinderValidationCriteria.hasOwnProperty("DO")).toBeTruthy();
            expect(selectedBinderValidationCriteria.hasOwnProperty("CL")).toBeTruthy();
            expect(selectedBinderValidationCriteria.hasOwnProperty("MD")).toBeFalsy();
        });

        it("Should reset binder validation criteria for the selected business categories on load", () => {
            // Actors
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);

            // Actions
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const criteriasInitial = binderValidationService.selectedBusinessCategoriesCriterias;
            pricingServiceSpy.and.returnValue([{ name: "DO" }] as Tag[]);
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const criteriasFinal = binderValidationService.selectedBusinessCategoriesCriterias;

            // Asserts
            expect(criteriasInitial).toBeDefined();
            expect(Object.keys(criteriasInitial).length).toBe(2);
            expect(criteriasInitial.DO).toBeDefined();
            expect(criteriasInitial.CL).toBeDefined();

            expect(criteriasFinal).toBeDefined();
            expect(Object.keys(criteriasFinal).length).toBe(1);
            expect(criteriasFinal.DO).toBeDefined();
        });

        it("Should initialise criteria on quote when loading criterias for selected business categories", () => {
            // Actions
            binderValidationService.loadCriteriasForSelectedBusinessCategoriesOnQuote(quote);

            // Asserts
            expect(quote.binderValidationCriteria).toBeDefined();
        });

        it("Should initialise binderValidationCriteria on quote when is null", () => {
            // Arrange
            quote.binderValidationCriteria = null;
            // Actions
            binderValidationService.loadCriteriasForSelectedBusinessCategoriesOnQuote(quote);

            // Asserts
            expect(quote.binderValidationCriteria).toEqual({});
        });

        it("Should getBusinessLineCodes return businessLines", () => {
            // Arrange
            let coverageType1 = new CoverageType();
            coverageType1.businessLine = new Tag();
            coverageType1.businessLine.name = "DA";
            coverageType1.businessLine.description = "Business Line 1";
            let coverageType2 = new CoverageType();
            coverageType2.businessLine = new Tag();
            coverageType2.businessLine.name = "EM";
            coverageType2.businessLine.description = "Business Line 2";

            let coverageTypes = [coverageType1, coverageType2];
            let expectedBusinessLineCodes = "DA,EM";

            // Actions
            let businessLineCodes = binderValidationService.getBusinessLineCodes(coverageTypes);

            // Asserts
            expect(businessLineCodes).toEqual(expectedBusinessLineCodes);
        });

        it("Should load criteria when loading criterias for selected business categories on quote", () => {
            // Actors
            quote.binderValidationCriteria = {
                DO: { binderSectionId: 2 } as BinderValidationCriteria,
                CL: { binderSectionId: 3 } as BinderValidationCriteria,
                MD: { binderSectionId: 4 } as BinderValidationCriteria
            };

            // Actions
            binderValidationService.loadCriteriasForSelectedBusinessCategoriesOnQuote(quote);

            // Asserts
            const criterias = binderValidationService.selectedBusinessCategoriesCriterias;
            expect(criterias).toBeDefined();
            expect(Object.keys(criterias).length).toBe(3);
            expect(criterias.DO).toBeDefined();
            expect(criterias.DO.length).toBe(1);
            expect(criterias.DO[0].binderSectionId).toBe(2);
            expect(criterias.CL).toBeDefined();
            expect(criterias.CL.length).toBe(1);
            expect(criterias.CL[0].binderSectionId).toBe(3);
            expect(criterias.MD).toBeDefined();
            expect(criterias.MD.length).toBe(1);
            expect(criterias.MD[0].binderSectionId).toBe(4);
        });

        it("Should reset criteria when loading criterias for selected business categories on quote", () => {
            // Actors
            quote.binderValidationCriteria = {
                DO: { binderSectionId: 2 } as BinderValidationCriteria,
                CL: { binderSectionId: 3 } as BinderValidationCriteria,
                MD: { binderSectionId: 4 } as BinderValidationCriteria
            };

            // Actions
            binderValidationService.loadCriteriasForSelectedBusinessCategoriesOnQuote(quote);
            const criteriasInitial = binderValidationService.selectedBusinessCategoriesCriterias;

            quote.binderValidationCriteria = {
                DO: { binderSectionId: 2 } as BinderValidationCriteria,
                CL: { binderSectionId: 3 } as BinderValidationCriteria
            };

            binderValidationService.loadCriteriasForSelectedBusinessCategoriesOnQuote(quote);
            const criteriasFinal = binderValidationService.selectedBusinessCategoriesCriterias;

            // Asserts
            expect(criteriasInitial).toBeDefined();
            expect(Object.keys(criteriasInitial).length).toBe(3);
            expect(criteriasInitial.DO).toBeDefined();
            expect(criteriasInitial.CL).toBeDefined();
            expect(criteriasInitial.MD).toBeDefined();

            expect(criteriasFinal).toBeDefined();
            expect(Object.keys(criteriasFinal).length).toBe(2);
            expect(criteriasFinal.DO).toBeDefined();
            expect(criteriasFinal.CL).toBeDefined();
        });

        it("Should return the interval with the max minUsRevenue which contains the rate with last year revenue percentage of 30", () => {
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const selectedBinderValidationCriteria = binderValidationService.selectedBusinessCategoriesCriterias;

            expect(selectedBinderValidationCriteria).toBeDefined();
            addRevenue(quote, 10, 30);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);

            expect(quote.binderValidationCriteria.hasOwnProperty("DO")).toBeTruthy();
            expect(quote.binderValidationCriteria.hasOwnProperty("CL")).toBeTruthy();
            expect(quote.binderValidationCriteria.DO.binderSectionId).toBe(5);
            expect(quote.binderValidationCriteria.CL.binderSectionId).toBe(2);
        });

        it("Should return the interval with the max minUSRevenue which contains the rate with last year revenue percentage of 50", () => {
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const selectedBinderValidationCriteria = binderValidationService.selectedBusinessCategoriesCriterias;

            expect(selectedBinderValidationCriteria).toBeDefined();
            addRevenue(quote, 10, 50);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);

            expect(quote.binderValidationCriteria.hasOwnProperty("DO")).toBeTruthy();
            expect(quote.binderValidationCriteria.hasOwnProperty("CL")).toBeTruthy();
            expect(quote.binderValidationCriteria.DO.binderSectionId).toBe(5);
            expect(quote.binderValidationCriteria.CL.binderSectionId).toBe(4);
        });

        it("Should return the interval with the max maxUsRevenue with last year revenue percentage of 70", () => {
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const selectedBinderValidationCriteria = binderValidationService.selectedBusinessCategoriesCriterias;

            expect(selectedBinderValidationCriteria).toBeDefined();
            addRevenue(quote, 10, 70);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);

            expect(quote.binderValidationCriteria.hasOwnProperty("DO")).toBeTruthy();
            expect(quote.binderValidationCriteria.hasOwnProperty("CL")).toBeTruthy();
            expect(quote.binderValidationCriteria.DO.binderSectionId).toBe(1);
            expect(quote.binderValidationCriteria.CL.binderSectionId).toBe(4);

        });
        it("Should return the interval with the min minUsRevenue  with last year revenue percentage of 9", () => {
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const selectedBinderValidationCriteria = binderValidationService.selectedBusinessCategoriesCriterias;

            expect(selectedBinderValidationCriteria).toBeDefined();
            addRevenue(quote, 10, 9);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);

            expect(quote.binderValidationCriteria.hasOwnProperty("DO")).toBeTruthy();
            expect(quote.binderValidationCriteria.hasOwnProperty("CL")).toBeTruthy();
            expect(quote.binderValidationCriteria.DO.binderSectionId).toBe(3);
            expect(quote.binderValidationCriteria.CL.binderSectionId).toBe(2);

        });

        it("Should return the intervals with the max MaxRevenue >= 100 and those will be filters by the usExposure", () => {
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const selectedBinderValidationCriteria = binderValidationService.selectedBusinessCategoriesCriterias;

            expect(selectedBinderValidationCriteria).toBeDefined();
            addRevenue(quote, 100, 30);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);

            expect(quote.binderValidationCriteria.hasOwnProperty("DO")).toBeTruthy();
            expect(quote.binderValidationCriteria.hasOwnProperty("CL")).toBeTruthy();
            expect(quote.binderValidationCriteria.DO.binderSectionId).toBe(1);
            expect(quote.binderValidationCriteria.CL.binderSectionId).toBe(2);

        });

        it("Should return the intervals with the max MaxRevenue >= 101 and those will be filters " +
            "and those will be filters by the usExposure ", () => {
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, testBusinessLineCodes);
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const selectedBinderValidationCriteria = binderValidationService.selectedBusinessCategoriesCriterias;

            expect(selectedBinderValidationCriteria).toBeDefined();
            addRevenue(quote, 101, 29.7);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);

            expect(quote.binderValidationCriteria.hasOwnProperty("DO")).toBeTruthy();
            expect(quote.binderValidationCriteria.hasOwnProperty("CL")).toBeTruthy();
            expect(quote.binderValidationCriteria.DO.binderSectionId).toBe(2);
            expect(quote.binderValidationCriteria.CL.binderSectionId).toBe(2);
        });

        it("Should not trigger US exposure warning when last year's revenue is 0", () => {
            // Actors
            pricingServiceSpy.and.returnValue([{ name: "DO" }] as Tag[]);
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, "DO");
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const warningMessagesInitial = binderValidationService.getBinderValidationWarningForTab(QuoteConfig.StepNr.Risk);

            // Actions
            addRevenue(quote, 0, 0);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);
            const warningMessagesFinal = binderValidationService.getBinderValidationWarningForTab(QuoteConfig.StepNr.Risk);

            // Asserts
            expect(warningMessagesInitial).toBeDefined();
            expect(warningMessagesInitial.length).toBe(0);
            expect(warningMessagesFinal).toBeDefined();
            expect(warningMessagesFinal.length).toBe(0);
        });

        it("Should not trigger US exposure warning for category when last year's revenue is 0", () => {
            // Actors
            pricingServiceSpy.and.returnValue([{ name: "DO" }] as Tag[]);
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, "DO");
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            const warningMessagesInitial = binderValidationService.getBinderValidationWarningForTab(QuoteConfig.StepNr.Risk, "DO");

            // Actions
            addRevenue(quote, 0, 0);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);
            const warningMessagesFinal = binderValidationService.getBinderValidationWarningForTab(QuoteConfig.StepNr.Risk, "DO");

            // Asserts
            expect(warningMessagesInitial).toBeDefined();
            expect(warningMessagesInitial.length).toBe(0);
            expect(warningMessagesFinal).toBeDefined();
            expect(warningMessagesFinal.length).toBe(0);
        });

        it("Should initialise Binders Criteria Validation from in progress quote", () => {
            // Actors
            quote.binderValidationCriteria = null;
            quote.state = QuoteState.InProgress;
            let spyLoadCriterias = spyOn(binderValidationService, "loadCriteriasForSelectedBusinessCategories");
            let spyLoadCriteriasOnQuote = spyOn(binderValidationService, "loadCriteriasForSelectedBusinessCategoriesOnQuote");
            let spyFilterBinders = spyOn(binderValidationService, "filterBindersCriteriaBasedOnRevenueFirst");

            // Actions
            binderValidationService.initialiseBindersCriteriaValidation(quote)

            // Asserts
            expect(spyLoadCriterias).toHaveBeenCalled();
            expect(spyLoadCriteriasOnQuote).not.toHaveBeenCalled();
            expect(spyFilterBinders).toHaveBeenCalled();
        });

        it("Should initialise Binders Criteria Validation from not in progress quote", () => {
            // Actors
            quote.binderValidationCriteria = null;
            quote.state = QuoteState.QuoteSent;
            let spyLoadCriterias = spyOn(binderValidationService, "loadCriteriasForSelectedBusinessCategories");
            let spyLoadCriteriasOnQuote = spyOn(binderValidationService, "loadCriteriasForSelectedBusinessCategoriesOnQuote");
            let spyFilterBinders = spyOn(binderValidationService, "filterBindersCriteriaBasedOnRevenueFirst");

            // Actions
            binderValidationService.initialiseBindersCriteriaValidation(quote)

            // Asserts
            expect(spyLoadCriterias).not.toHaveBeenCalled();
            expect(spyLoadCriteriasOnQuote).toHaveBeenCalled();
            expect(spyFilterBinders).toHaveBeenCalled();
        });

        it("Should getBinderValidationWarningMessages return false when bindersCriteriaValidationWarningMessages is empty", () => {
            // Actors
            pricingServiceSpy.and.returnValue([{ name: "DO" }] as Tag[]);
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, "DO");
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);

            // Actions
            let result = binderValidationService.getBinderValidationWarningMessages();

            // Asserts
            expect(result).toBeFalsy();
        });

        // This test cannot be done as there's no way to set a warning message for this.bindersValidationWarningMessages[key].Risk or this.bindersValidationWarningMessages[key].Coverages
        xit("Should getBinderValidationWarningMessages return true when bindersCriteriaValidationWarningMessages is not empty", () => {
            // Actors
            pricingServiceSpy.and.returnValue([{ name: "DO" }] as Tag[]);
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, "DO");
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote); // we need to be able to set a warning message for Risk or Coverages here

            // Actions
            let result = binderValidationService.getBinderValidationWarningMessages();

            // Asserts
            expect(result).toBeTruthy();
        });

        it("Should areBinderSectionsForAllBC return true when bindersCriteriaValidationWarningMessages Coverages is empty", () => {
            // Actors
            pricingServiceSpy.and.returnValue([{ name: "DO" }] as Tag[]);
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, "DO");
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote);

            // Actions
            let result = binderValidationService.areBinderSectionsForAllBC();

            // Asserts
            expect(result).toBeTruthy();
        });

        // This test cannot be done as there's no way to set a warning message for this.bindersValidationWarningMessages[key].Coverages, also this method is not being used
        xit("Should areBinderSectionsForAllBC return false when bindersCriteriaValidationWarningMessages Coverages is not empty", () => {
            // Actors
            pricingServiceSpy.and.returnValue([{ name: "DO" }] as Tag[]);
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, "DO");
            binderValidationService.loadCriteriasForSelectedBusinessCategories(quote);
            binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(quote); // we need to be able to set a warning message for Coverages here

            // Actions
            let result = binderValidationService.areBinderSectionsForAllBC();

            // Asserts
            expect(result).toBeFalsy();
        });

        // This method is not being used, and it is useless as we do not have a way to set a warning message for this.bindersValidationWarningMessages[key].Risk
        it("Should generateBinderValidationWarningsForTab call filterBindersCriteriaBasedOnRevenueFirst when is Risk Step", () => {
            // Actors
            let spyFilterBinders = spyOn(binderValidationService, "filterBindersCriteriaBasedOnRevenueFirst");

            // Actions
            binderValidationService.generateBinderValidationWarningsForTab(4, quote);

            // Asserts
            expect(spyFilterBinders).toHaveBeenCalled();
        });
    });

    describe("Terrorism binder validation filtering", () => {
        const testDraftQuoteId = "Quote:xyz789";
        const terrorismProductId = 23;
        const terrorismAvoidedBinderSectionIds = [1290, 1395, 1396, 1398, 1399, 1404, 1405];

        let binderValidationService: BinderValidationService;

        beforeEach(inject([BinderValidationService],
            (bs: BinderValidationService) => {
                binderValidationService = bs;
            }
        ));

        it("Should filter avoided binder section IDs when productId is 23 and TR has multiple criterias", () => {
            // Arrange
            const businessLineCodes = "TR";

            // Act
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, businessLineCodes, terrorismProductId);
            const criterias = binderValidationService.binderValidationCriterias;

            // Assert
            expect(criterias.TR).toBeDefined();
            expect(criterias.TR.length).toBe(2);
            
            const binderSectionIds = criterias.TR.map(c => c.binderSectionId);

            // Should keep non-avoided IDs
            expect(binderSectionIds).toContain(1289);
            expect(binderSectionIds).toContain(1400);

            // Should filter out avoided IDs
            expect(binderSectionIds).not.toContain(1290);
            expect(binderSectionIds).not.toContain(1395);
            expect(binderSectionIds).not.toContain(1399);

            // Verify no avoided IDs remain
            const hasAvoidedIds = binderSectionIds.some(id => terrorismAvoidedBinderSectionIds.includes(id));
            expect(hasAvoidedIds).toBe(false);
        });

        it("Should not filter binder section IDs when productId is not 23", () => {
            // Arrange
            const businessLineCodes = "TR";
            const otherProductId = 20;

            // Act
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, businessLineCodes, otherProductId);
            const criterias = binderValidationService.binderValidationCriterias;

            // Assert
            expect(criterias.TR).toBeDefined();
            expect(criterias.TR.length).toBe(5);

            const binderSectionIds = criterias.TR.map(c => c.binderSectionId);

            // All IDs should remain, including avoided ones
            expect(binderSectionIds).toContain(1289);
            expect(binderSectionIds).toContain(1290);
            expect(binderSectionIds).toContain(1395);
            expect(binderSectionIds).toContain(1399);
            expect(binderSectionIds).toContain(1400);
        });

        it("Should not filter when productId is 23 but TR has only 1 criteria", () => {
            // Arrange
            const businessLineCodes = "TR";

            // Modify the existing spy to return only 1 TR criteria
            (binderValidationHttpService.getBinderValidationCriterias as jasmine.Spy).and.returnValue(
                from([{
                    TR: [
                        {
                            binderSectionId: 1290, // This is an avoided ID
                            maxFee: 500,
                            maxLimit: 5000000,
                            maxRevenue: 100,
                            usMaxExposure: 0.4,
                            usMinExposure: 0.1
                        }
                    ] as BinderValidationCriteria[]
                }])
            );

            // Act
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, businessLineCodes, terrorismProductId);
            const criterias = binderValidationService.binderValidationCriterias;

            // Assert
            expect(criterias.TR).toBeDefined();
            expect(criterias.TR.length).toBe(1);

            // Should not filter due to length condition (length > 1)
            expect(criterias.TR[0].binderSectionId).toBe(1290);
        });

        it("Should handle missing TR business line gracefully when productId is 23", () => {
            // Arrange
            const businessLineCodes = "DO,CL";

            // Act
            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, businessLineCodes, terrorismProductId);
            const criterias = binderValidationService.binderValidationCriterias;

            // Assert
            expect(criterias.TR).toBeUndefined();

            // Other business lines should load correctly
            expect(criterias.DO).toBeDefined();
            expect(criterias.DO.length).toBe(4);
            expect(criterias.CL).toBeDefined();
            expect(criterias.CL.length).toBe(4);
        });
    });

    describe("Gets terrorism binder section ID", () => {
        const testDraftQuoteId = "Quote:xyz789";
        const terrorismProductId = 23;

        let binderValidationService: BinderValidationService;

        beforeEach(inject([BinderValidationService],
            (bs: BinderValidationService) => {
                binderValidationService = bs;
            }
        ));

        it("getFirstBinderSectionIdByBusinessLineCode('DO') should return first DO binder section ID", () => {
            const businessLineCodes = "DO";

            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, businessLineCodes);
            const firstId = binderValidationService.getFirstBinderSectionIdByBusinessLineCode("DO");

            expect(firstId).toBe(1);
        });

        it("getFirstBinderSectionIdByBusinessLineCode('UNKNOWN') should return null", () => {
            const businessLineCodes = "DO";

            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, businessLineCodes);
            const firstId = binderValidationService.getFirstBinderSectionIdByBusinessLineCode("UNKNOWN");

            expect(firstId).toBeNull();
        });

        it("getTerrorismBinderSectionId() should return first TR binder section ID", () => {
            const businessLineCodes = "TR";

            binderValidationService.loadBinderValidationCriterias(testDraftQuoteId, businessLineCodes, terrorismProductId);
            const terrorismSectionId = binderValidationService.getTerrorismBinderSectionId();

            expect(terrorismSectionId).toBe(1289);
        });
    });
});

@Injectable()
class MockBinderValidationHttpService {
    public getBinderValidationCriterias(draftQuoteId: string, businessLineCodes?: string): Observable<{
        [businessCategoryTagName: string]: BinderValidationCriteria[]
    }> {
        const allCriterias: { [businessCategoryTagName: string]: BinderValidationCriteria[] } = {};

        allCriterias.DO = [
            {
                binderSectionId: 1,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 100,
                usMaxExposure: 0.6,
                usMinExposure: 0.25
            },
            {
                binderSectionId: 2,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 101,
                usMaxExposure: 0.5,
                usMinExposure: 0.2
            },
            {
                binderSectionId: 3,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 90,
                usMaxExposure: 0.3,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 5,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 89,
                usMaxExposure: 0.5,
                usMinExposure: 0.3
            }
        ] as BinderValidationCriteria[];
        allCriterias.CL = [
            {
                binderSectionId: 2,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 101,
                usMaxExposure: 0.3,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 1,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 102,
                usMaxExposure: 0.4,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 3,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 103,
                usMaxExposure: 0.5,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 4,
                maxFee: 1000,
                maxLimit: 10000000,
                maxRevenue: 103,
                usMaxExposure: 0.5,
                usMinExposure: 0.1
            }
        ] as BinderValidationCriteria[];
        allCriterias.MD = [
            { binderSectionId: 4 }
        ] as BinderValidationCriteria[];
        allCriterias.TR = [
            {
                binderSectionId: 1289,
                maxFee: 500,
                maxLimit: 5000000,
                maxRevenue: 100,
                usMaxExposure: 0.4,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 1290,
                maxFee: 500,
                maxLimit: 5000000,
                maxRevenue: 100,
                usMaxExposure: 0.4,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 1395,
                maxFee: 500,
                maxLimit: 5000000,
                maxRevenue: 100,
                usMaxExposure: 0.4,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 1400,
                maxFee: 500,
                maxLimit: 5000000,
                maxRevenue: 100,
                usMaxExposure: 0.4,
                usMinExposure: 0.1
            },
            {
                binderSectionId: 1399,
                maxFee: 500,
                maxLimit: 5000000,
                maxRevenue: 100,
                usMaxExposure: 0.4,
                usMinExposure: 0.1
            }
        ] as BinderValidationCriteria[];

        // Filter based on businessLineCodes parameter
        const criterias: { [businessCategoryTagName: string]: BinderValidationCriteria[] } = {};
        if (businessLineCodes) {
            const requestedCodes = businessLineCodes.split(',');
            requestedCodes.forEach(code => {
                if (allCriterias[code]) {
                    criterias[code] = allCriterias[code];
                }
            });
        } else {
            // If no filter specified, return all
            Object.assign(criterias, allCriterias);
        }

        return from([criterias]);
    }
}

@Injectable()
class MockPricingService {
    private businessLine1 = {
        name: "DO",
        description: "Test Business Line 1"
    } as Tag;

    private businessLine2 = {
        name: "CL",
        description: "Test Business Line 2"
    } as Tag;

    public getBusinessLines(quote: Quote): Tag[] {
        return [this.businessLine1, this.businessLine2];
    }
}
