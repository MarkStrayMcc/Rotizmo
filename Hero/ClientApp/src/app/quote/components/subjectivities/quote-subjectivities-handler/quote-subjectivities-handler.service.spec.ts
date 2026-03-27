/// <reference path="../../../../../../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="quote-subjectivities-handler.service.ts" />
import { inject, TestBed } from "@angular/core/testing";
import { QuoteSubjectivity, Subjectivity } from "@app/models";
import { QuoteSubjectivitiesHandlerService } from "@app/quote/components/subjectivities/quote-subjectivities-handler/quote-subjectivities-handler.service";

describe("QuoteSubjectivitiesHandlerService",
    () => {
        describe("Service injection tests",
            () => {
                beforeEach(() => {
                    TestBed.configureTestingModule({
                        providers: [QuoteSubjectivitiesHandlerService]
                    });
                });

                it("Should be created",
                    inject([QuoteSubjectivitiesHandlerService],
                        (service: QuoteSubjectivitiesHandlerService) => {
                            expect(service).toBeTruthy();
                        }));
            });

        describe("Some isolated unit tests",
            () => {
                let quoteSubjectivitiesHandlerService: QuoteSubjectivitiesHandlerService;

                beforeEach(() => {
                    quoteSubjectivitiesHandlerService = new QuoteSubjectivitiesHandlerService();
                });

                it("should have no quoteSubjectivities initially",
                    () => {
                        quoteSubjectivitiesHandlerService.quoteSubjectivities$.subscribe((quoteSubjectivities) =>
                            expect(quoteSubjectivities.length).toBe(0))
                    });

                it("should add quotesubjectivity",
                    () => {
                        let exampleQuoteSubjectivity =
                            {
                                quoteSubjectivityId: 1,
                                quoteId: 19876,
                                subjectivity: {
                                    subjectivityId: 1,
                                    text: "Blahbjectivity"
                                } as Subjectivity,
                                isPost: false,
                                days: 0
                            } as QuoteSubjectivity;

                        quoteSubjectivitiesHandlerService.addQuoteSubjectivity(exampleQuoteSubjectivity);
                        quoteSubjectivitiesHandlerService.quoteSubjectivities$.subscribe((quoteSubjectivities) =>
                            expect(quoteSubjectivities.length).toBe(1));
                    });

                it("should remove quotesubjectivity when removing a quoteSubjectivity at index < length of the array of quote subjectivities",
                    () => {
                        let exampleQuoteSubjectivity =
                            {
                                quoteSubjectivityId: 1,
                                quoteId: 19876,
                                subjectivity: {
                                    subjectivityId: 1,
                                    text: "Blahbjectivity"
                                } as Subjectivity,
                                isPost: false,
                                days: 0
                            } as QuoteSubjectivity;
                        quoteSubjectivitiesHandlerService.addQuoteSubjectivity(exampleQuoteSubjectivity);
                        quoteSubjectivitiesHandlerService.removeQuoteSubjectivity(0);
                        quoteSubjectivitiesHandlerService.quoteSubjectivities$.subscribe((quoteSubjectivities) =>
                            expect(quoteSubjectivities.length).toBe(0));
                    });

                it("should throw error when attempting to remove a quoteSubjectivity at index > length of array of quote subjectivities",
                    () => {
                        let exampleQuoteSubjectivity =
                            {
                                quoteSubjectivityId: 1,
                                quoteId: 19876,
                                subjectivity: {
                                    subjectivityId: 1,
                                    text: "Blahbjectivity"
                                } as Subjectivity,
                                isPost: false,
                                days: 0
                            } as QuoteSubjectivity;
                        quoteSubjectivitiesHandlerService.addQuoteSubjectivity(exampleQuoteSubjectivity);
                        quoteSubjectivitiesHandlerService.removeQuoteSubjectivity(2);
                        quoteSubjectivitiesHandlerService.quoteSubjectivities$
                            .subscribe(
                                (quoteSubjectivities) => { },
                                (error: any) => {
                                    expect(error).toContain("Index out of bounds!");
                                }
                            );
                    });

                it("should throw error when attempting to remove a quoteSubjectivity at index = length of array of quote subjectivities",
                    () => {
                        quoteSubjectivitiesHandlerService.removeQuoteSubjectivity(0);
                        quoteSubjectivitiesHandlerService.quoteSubjectivities$
                            .subscribe(
                                (quoteSubjectivities) => { },
                                (error: any) => {
                                    expect(error).toContain("Index out of bounds!");
                                }
                            );
                    });
            });
    });
