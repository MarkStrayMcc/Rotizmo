import { PolicyLocationPremiums } from '@app/quote/models/pricing/PolicyLocationPremiums';
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { QuoteService } from "./quote.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";
import { ClientLocation, PricingInformation, Quote, QuoteState } from "@app/models";
import { PropertyLimit } from "../models/property-limit.model";
import { LocationOutput } from "../models/pricing/LocationOutput";
import { CoverageService } from "@app/services/coverage.service";
import { UserService } from '@app/services/user.service';

const ratingReference1 = "21780e82-8a8c-4446-a35d-5a3a3f0b5254";
const ratingReference2 = "1858e18c-7de7-4e80-b6f6-f87761b024d5";

describe("QuoteService", () => {
    let service: QuoteService;
    let mockCoverageService = jasmine.createSpyObj("CoverageService", ["getMultiplePropertiesBusinessLine", "setMultiplePropertiesBusinessLine"]);
    let mockUserService = jasmine.createSpyObj("UserService", ["isFeatureAccessible"]);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                QuoteService,
                CurrencyHttpService,
                { provide: CoverageService, useValue: mockCoverageService },
                { provide: UserService, useValue: mockUserService }],
        });

        service = TestBed.inject(QuoteService);

        mockCoverageService.getMultiplePropertiesBusinessLine.and.returnValue("MD");
        mockUserService.isFeatureAccessible.and.returnValue(true);
    });

    it("Should be created", () => {
        expect(service).toBeTruthy();
    });

    describe("with valid quote", () => {
        beforeEach(() => {
            // Initialise with a quote
            let quote: Quote = new Quote();
            quote.quoteReference = 123;
            quote.state = QuoteState.Saved;
            service.updateQuote(quote, true);
        });

        it("Should return the quote", () => {
            // Act
            const result = service.getQuote();

            // Assert
            expect(result).not.toBeNull();
        });

        describe("isSaved()", () => {
            it("Should return TRUE when Quote Reference is assigned", () => {
                // Act
                const result = service.isSaved();

                // Assert
                expect(result).toBe(true);
            });

            it("Should return FALSE for null Quote", () => {
                // Arrange
                service.updateQuote(null, true);
                // Act
                const result = service.isSaved();

                // Assert
                expect(result).toBe(false);
            });

            it("Should return FALSE for null QuoteReference", () => {
                // Arrange
                service.setPropertyValue("quoteReference", null);

                // Act
                const result = service.isSaved();

                // Assert
                expect(result).toBe(false);
            });

            it("Should return FALSE for undefined QuoteReference", () => {
                // Arrange
                service.setPropertyValue("quoteReference", undefined);

                // Act
                const result = service.isSaved();

                // Assert
                expect(result).toBe(false);
            });

            it("Should return FALSE for QuoteReference set to 0", () => {
                // Arrange
                service.setPropertyValue("quoteReference", 0);

                // Act
                const result = service.isSaved();

                // Assert
                expect(result).toBe(false);
            });
        });

        describe("isUpdating()", () => {
            it("should return false when quote state is not In Progress", () => {
                // Act
                const result = service.isUpdating();

                // Assert
                expect(result).toBe(false);
            });

            it("Should return FALSE for null Quote", () => {
                // Arrange
                service.updateQuote(null, true);
                // Act
                const result = service.isUpdating();

                // Assert
                expect(result).toBe(false);
            });

            it("should return true when quote state is In Progress", () => {
                // Arrange
                service.setPropertyValue("state", QuoteState.InProgress);

                // Act
                const result = service.isUpdating();

                // Assert
                expect(result).toBe(true);
            });
        });

        describe("hasPropertyLimits()", () => {
            it("should return false when quote does not have property limits", () => {
                // Act
                const result = service.hasPropertyLimits();

                // Assert
                expect(result).toBe(false);
            });

            it("should return false when quote has empty property limits", () => {
                // Arrange
                service.setPropertyValue("propertyLimits", []);

                // Act
                const result = service.hasPropertyLimits();

                // Assert
                expect(result).toBe(false);
            });

            it("Should return FALSE for null Quote", () => {
                // Arrange
                service.updateQuote(null, true);
                // Act
                const result = service.hasPropertyLimits();

                // Assert
                expect(result).toBe(false);
            });

            it("should return true when quote has populated property limits", () => {
                // Arrange
                const limit = new PropertyLimit();
                const propertyLimits: PropertyLimit[] = [limit];
                service.setPropertyValue("propertyLimits", propertyLimits);

                // Act
                const result = service.hasPropertyLimits();

                // Assert
                expect(result).toBe(true);
            });

            it("should have populated property limits on quote object when location outputs are present", () => {
                // Arrange
                const locationOutputs: LocationOutput[] = [
                    {
                        id: ratingReference1,
                        modelPremium: 1000,
                        suggestedPremium: 1000,
                    },
                    {
                        id: ratingReference2,
                        modelPremium: 2000,
                        suggestedPremium: 2000,
                    },
                ];

                const propertyLimits: PropertyLimit[] = [
                    {
                        ratingReference: ratingReference1,
                        totalInsuredValue: 1000,
                        insuredAddress: new ClientLocation(),
                    },
                    {
                        ratingReference: ratingReference2,
                        totalInsuredValue: 2000,
                        insuredAddress: new ClientLocation(),
                    },
                ];
                service.setPropertyValue("propertyLimits", propertyLimits);

                // Act
                service.mapLocationPremiumsToPropertyLimits(locationOutputs);
                let result = service.getQuote();

                // Assert
                const propertyLimit1 = result.propertyLimits.find(x => x.ratingReference == ratingReference1);
                const propertyLimit2 = result.propertyLimits.find(x => x.ratingReference == ratingReference2);
                const locationOutput1 = locationOutputs.find(x => x.id == ratingReference1);
                const locationOutput2 = locationOutputs.find(x => x.id == ratingReference2);

                expect(propertyLimit1.quoteLocationPremiums[0].modelPremium).toBe(locationOutput1.modelPremium);
                expect(propertyLimit1.quoteLocationPremiums[0].suggestedPremium).toBe(locationOutput1.suggestedPremium);
                expect(propertyLimit1.quoteLocationPremiums[0].quotedPremium).toBe(locationOutput1.suggestedPremium);
                expect(propertyLimit1.quoteLocationPremiums[0].businessLineCode).toBe("MD");
                expect(propertyLimit2.quoteLocationPremiums[0].modelPremium).toBe(locationOutput2.modelPremium);
                expect(propertyLimit2.quoteLocationPremiums[0].suggestedPremium).toBe(locationOutput2.suggestedPremium);
                expect(propertyLimit2.quoteLocationPremiums[0].quotedPremium).toBe(locationOutput2.suggestedPremium);
                expect(propertyLimit2.quoteLocationPremiums[0].businessLineCode).toBe("MD");
            });
        });

        describe("hasQuoteLocationPremium()", () => {
            it("should return false when quote does not have location premiums", () => {
                // Act
                const result = service.hasQuoteLocationPremiums();

                // Assert
                expect(result).toBe(false);
            });

            it("should return false when quote has empty location premiums", () => {
                // Arrange
                const propertyLimits: PropertyLimit[] = [
                    {
                        quoteLocationPremiums: [],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    },
                ];
                service.setPropertyValue("propertyLimits", propertyLimits);

                // Act
                const result = service.hasQuoteLocationPremiums();

                // Assert
                expect(result).toBe(false);
            });

            it("Should return FALSE for null Quote", () => {
                // Arrange
                service.updateQuote(null, true);
                // Act
                const result = service.hasQuoteLocationPremiums();

                // Assert
                expect(result).toBe(false);
            });

            it("should return true when quote has populated location premiums", () => {
                // Arrange
                const propertyLimits: PropertyLimit[] = [
                    {
                        quoteLocationPremiums: [
                            {
                                modelPremium: 1000,
                                suggestedPremium: 1000,
                                quotedPremium: 1000,
                                businessLineCode: "MD",
                            },
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    },
                ];
                service.setPropertyValue("propertyLimits", propertyLimits);

                // Act
                const result = service.hasQuoteLocationPremiums();

                // Assert
                expect(result).toBe(true);
            });
        });

        describe("isMultipleProperties()", () => {
            it("should return true when feature is active and is multiple properties business line", () => {
                // Act
                const result = service.isMultipleProperties();

                // Assert
                expect(result).toBe(true);
            });

            it("should return false when feature is NOT active", () => {
                // Arrange
                mockUserService.isFeatureAccessible.and.returnValue(false);

                // Act
                const result = service.isMultipleProperties();

                // Assert
                expect(result).toBe(false);
            });

            it("should return false when is NOT multiple properties business line", () => {
                // Arrange
                mockCoverageService.getMultiplePropertiesBusinessLine.and.returnValue("");

                // Act
                const result = service.isMultipleProperties();

                // Assert
                expect(result).toBe(false);
            });
        });

        describe("applyModelDiscountToLocationPremiums", () => {
            it("should correctly apply discount to premiums", () => {
                // Arrange
                const pricingInformation: PricingInformation[] = [
                    <PricingInformation>{ businessLine: { name: "MD", description: "Test" }, quoted: 2666.66, model: 4000 },
                    <PricingInformation>{ businessLine: { name: "CP", description: "Cyber and Privacy" }, quoted: 2791, model: 3000 },
                ]
                service.setPropertyValue("pricingInformation", pricingInformation);

                const propertyLimits: PropertyLimit[] = [
                    {
                        quoteLocationPremiums: [
                            {
                                modelPremium: 3000,
                                suggestedPremium: 3000,
                                quotedPremium: 3000,
                                businessLineCode: "MD",
                            },
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    },
                    {
                        quoteLocationPremiums: [
                            {
                                modelPremium: 1000,
                                suggestedPremium: 1000,
                                quotedPremium: 1000,
                                businessLineCode: "MD",
                            },
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    },
                    {
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    }
                ];
                service.setPropertyValue("propertyLimits", propertyLimits);
                // Act
                service.applyModelDiscountToLocationPremiums();

                // Assert
                const result = service.getQuote();
                const quoteLocation1 = result.propertyLimits[0].quoteLocationPremiums[0];
                const quoteLocation2 = result.propertyLimits[1].quoteLocationPremiums[0];
                const pricingForEnabledBusinessLine = result.pricingInformation[0];

                expect(quoteLocation1.quotedPremium).toBe(1999.99);
                expect(quoteLocation2.quotedPremium).toBe(666.67);
                expect(quoteLocation1.quotedPremium + quoteLocation2.quotedPremium).toBe(pricingForEnabledBusinessLine.quoted);
            });

            it("negative discounts increase premiums", () => {
                // Arrange
                const pricingInformation: PricingInformation[] = [
                    <PricingInformation>{ businessLine: { name: "MD", description: "Test" }, quoted: 5333.33, model: 4000 },
                    <PricingInformation>{ businessLine: { name: "CP", description: "Cyber and Privacy" }, quoted: 2791, model: 3000 },
                ]
                service.setPropertyValue("pricingInformation", pricingInformation);

                const propertyLimits: PropertyLimit[] = [
                    {
                        quoteLocationPremiums: [
                            {
                                modelPremium: 3000,
                                suggestedPremium: 3000,
                                quotedPremium: 3000,
                                businessLineCode: "MD",
                            },
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    },
                    {
                        quoteLocationPremiums: [
                            {
                                modelPremium: 1000,
                                suggestedPremium: 1000,
                                quotedPremium: 1000,
                                businessLineCode: "MD",
                            },
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    }
                ];
                service.setPropertyValue("propertyLimits", propertyLimits);
                // Act
                service.applyModelDiscountToLocationPremiums();

                // Assert
                const result = service.getQuote();
                const quoteLocation1 = result.propertyLimits[0].quoteLocationPremiums[0];
                const quoteLocation2 = result.propertyLimits[1].quoteLocationPremiums[0];
                const pricingForEnabledBusinessLine = result.pricingInformation[0];

                expect(quoteLocation1.quotedPremium).toBe(4000);
                expect(quoteLocation2.quotedPremium).toBe(1333.33);
                expect(quoteLocation1.quotedPremium + quoteLocation2.quotedPremium).toBe(pricingForEnabledBusinessLine.quoted);
            });
        });

        describe("roundQuoteLocationQuotedPremiums", () => {
            it("should apply rounding to premiums", () => {
                // Arrange
                const propertyLimits: PropertyLimit[] = [
                    {
                        quoteLocationPremiums: [
                            {
                                modelPremium: 2000,
                                suggestedPremium: 2000,
                                quotedPremium: 1333.33,
                                businessLineCode: "MD",
                            },
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    },
                    {
                        quoteLocationPremiums: [
                            {
                                modelPremium: 1000,
                                suggestedPremium: 1000,
                                quotedPremium: 666.66,
                                businessLineCode: "MD",
                            },
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    }
                ];
                service.setPropertyValue("propertyLimits", propertyLimits);
                // Act
                service.roundQuoteLocationQuotedPremiums(2000);

                // Assert

                var result = service.getQuote();
                expect(result.propertyLimits[1].quoteLocationPremiums[0].quotedPremium).toBe(666.66);
                expect(result.propertyLimits[0].quoteLocationPremiums[0].quotedPremium).toBe(1333.34);
            });

            it("should apply rounding to premiums (rounding down)", () => {
                // Arrange
                const propertyLimits: PropertyLimit[] = [
                    {
                        quoteLocationPremiums: [
                            {
                                modelPremium: 2000,
                                suggestedPremium: 2000,
                                quotedPremium: 1333.34,
                                businessLineCode: "MD",
                            },
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    },
                    {
                        quoteLocationPremiums: [
                            {
                                modelPremium: 1000,
                                suggestedPremium: 1000,
                                quotedPremium: 666.67,
                                businessLineCode: "MD",
                            },
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    }
                ];
                service.setPropertyValue("propertyLimits", propertyLimits);
                // Act
                service.roundQuoteLocationQuotedPremiums(2000);

                // Assert

                var result = service.getQuote();
                expect(result.propertyLimits[1].quoteLocationPremiums[0].quotedPremium).toBe(666.67);
                expect(result.propertyLimits[0].quoteLocationPremiums[0].quotedPremium).toBe(1333.33);
            });
        });

        describe("calculatePolicyLocationPremiums", () => {

            let propertyLimits: PropertyLimit[];
            let newLocationOutputs: LocationOutput[];
            let pricingInformation: PricingInformation[]

            beforeEach(() => {
                propertyLimits = [
                    {
                        ratingReference: ratingReference1,
                        propertyLimitId: 1,
                        quoteLocationPremiums: [
                            {
                                businessLineCode: "MD",
                                modelPremium: 1000,
                                suggestedPremium: 1000,
                                quotedPremium: 1000,
                            }
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    },
                    {
                        ratingReference: ratingReference2,
                        propertyLimitId: 2,
                        quoteLocationPremiums: [
                            {
                                businessLineCode: "MD",
                                modelPremium: 2000,
                                suggestedPremium: 2000,
                                quotedPremium: 2000,
                            }
                        ],
                        insuredAddress: new ClientLocation(),
                        totalInsuredValue: 1000
                    }
                ];
                newLocationOutputs = [
                    {
                        id: ratingReference1,
                        modelPremium: 1500,
                        suggestedPremium: 1500,
                    },
                    {
                        id: ratingReference2,
                        modelPremium: 3000,
                        suggestedPremium: 3000,
                    },
                ];

                pricingInformation = [
                    <PricingInformation>{ businessLine: { name: "MD", description: "Test" }, quoted: 4500, model: 4000 },
                    <PricingInformation>{ businessLine: { name: "CP", description: "Cyber and Privacy" }, quoted: 2791, model: 3000 },
                ];

                service.setPropertyValue("propertyLimits", propertyLimits);
            });

            it("should map model and suggested premium values from new locationOutputs to policyLocationPremiums", () => {
                // Arrange

                // Act
                const policyLocationPremiums = service.calculatePolicyLocationPremiums(pricingInformation, newLocationOutputs);

                // Assert
                expect(policyLocationPremiums.length).toBe(newLocationOutputs.length);
                expect(policyLocationPremiums[0].modelPremium).toBe(newLocationOutputs[0].modelPremium);
                expect(policyLocationPremiums[0].suggestedPremium).toBe(newLocationOutputs[0].suggestedPremium);
                expect(policyLocationPremiums[1].modelPremium).toBe(newLocationOutputs[1].modelPremium);
                expect(policyLocationPremiums[1].suggestedPremium).toBe(newLocationOutputs[1].suggestedPremium);
            });

            it("should find and set correct property limit Id and business line values from quote property limits", () => {
                // Arrange

                // Act

                const policyLocationPremiums = service.calculatePolicyLocationPremiums(pricingInformation, newLocationOutputs);

                // Assert
                expect(policyLocationPremiums.length).toBe(newLocationOutputs.length);
                expect(policyLocationPremiums[0].propertyLimitId).toBe(propertyLimits[0].propertyLimitId);
                expect(policyLocationPremiums[0].businessLineCode).toBe(propertyLimits[0].quoteLocationPremiums[0].businessLineCode);
                expect(policyLocationPremiums[1].propertyLimitId).toBe(propertyLimits[1].propertyLimitId);
                expect(policyLocationPremiums[1].businessLineCode).toBe(propertyLimits[1].quoteLocationPremiums[0].businessLineCode);
            });

            it("should proportion policy location premiums correctly", () => {
                // Arrange

                // Act

                const policyLocationPremiums = service.calculatePolicyLocationPremiums(pricingInformation, newLocationOutputs);

                // Assert
                expect(policyLocationPremiums.length).toBe(newLocationOutputs.length);
                expect(policyLocationPremiums[0].quotedPremium).toBe(1500);
                expect(policyLocationPremiums[1].quotedPremium).toBe(3000);
            });

            it("should proportion policy location premiums correctly when new location outputs are null", () => {
                // Arrange
                newLocationOutputs = null;
                // Act

                const policyLocationPremiums = service.calculatePolicyLocationPremiums(pricingInformation, newLocationOutputs);

                // Assert
                expect(policyLocationPremiums.length).toBe(2);
                expect(policyLocationPremiums[0].quotedPremium).toBe(1500);
                expect(policyLocationPremiums[0].modelPremium).toBe(1000);
                expect(policyLocationPremiums[0].suggestedPremium).toBe(1000);
                expect(policyLocationPremiums[1].quotedPremium).toBe(3000);
                expect(policyLocationPremiums[1].modelPremium).toBe(2000);
                expect(policyLocationPremiums[1].suggestedPremium).toBe(2000);
            });

            it("should map policy location premiums correctly when new location outputs are null", () => {
                // Arrange
                newLocationOutputs = null;
                pricingInformation = [
                    <PricingInformation>{ businessLine: { name: "MD", description: "Test" }, quoted: 3000, model: 4000 },
                    <PricingInformation>{ businessLine: { name: "CP", description: "Cyber and Privacy" }, quoted: 2791, model: 3000 },
                ];
                // Act

                const policyLocationPremiums = service.calculatePolicyLocationPremiums(pricingInformation, newLocationOutputs);

                // Assert
                expect(policyLocationPremiums.length).toBe(2);
                expect(policyLocationPremiums[0].quotedPremium).toBe(1000);
                expect(policyLocationPremiums[0].modelPremium).toBe(1000);
                expect(policyLocationPremiums[0].suggestedPremium).toBe(1000);
                expect(policyLocationPremiums[1].quotedPremium).toBe(2000);
                expect(policyLocationPremiums[1].modelPremium).toBe(2000);
                expect(policyLocationPremiums[1].suggestedPremium).toBe(2000);
            });

            it("should round policy location premiums correctly", () => {
                // Arrange
                propertyLimits[0].quoteLocationPremiums[0].quotedPremium = 1000;
                propertyLimits[1].quoteLocationPremiums[0].quotedPremium = 1000;

                service.setPropertyValue("propertyLimits", propertyLimits);

                pricingInformation = [
                    <PricingInformation>{ businessLine: { name: "MD", description: "Test" }, quoted: 2666.67, model: 4000 },
                    <PricingInformation>{ businessLine: { name: "CP", description: "Cyber and Privacy" }, quoted: 2791, model: 3000 },
                ];

                // Act

                const policyLocationPremiums = service.calculatePolicyLocationPremiums(pricingInformation, newLocationOutputs);

                // Assert
                expect(policyLocationPremiums.length).toBe(newLocationOutputs.length);
                expect(policyLocationPremiums[0].quotedPremium + policyLocationPremiums[1].quotedPremium).toBe(pricingInformation[0].quoted);
            });

            it("should apply rounding change to most expensive premium", () => {
                // Arrange
                propertyLimits[0].quoteLocationPremiums[0].quotedPremium = 1000;
                propertyLimits[1].quoteLocationPremiums[0].quotedPremium = 4000;

                service.setPropertyValue("propertyLimits", propertyLimits);

                pricingInformation = [
                    <PricingInformation>{ businessLine: { name: "MD", description: "Test" }, quoted: 6666.67, model: 4000 },
                    <PricingInformation>{ businessLine: { name: "CP", description: "Cyber and Privacy" }, quoted: 2791, model: 3000 },
                ];

                // Act

                const policyLocationPremiums = service.calculatePolicyLocationPremiums(pricingInformation, newLocationOutputs);

                // Assert
                expect(policyLocationPremiums.length).toBe(newLocationOutputs.length);
                expect(policyLocationPremiums[0].quotedPremium).toBe(1333.33);
                expect(policyLocationPremiums[1].quotedPremium).toBe(5333.34);
            })
        });
    });
});
