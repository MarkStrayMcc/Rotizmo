import { Injectable } from "@angular/core";
import { inject, TestBed } from "@angular/core/testing";
import { Coverage, PricingGroup } from "@app/models";
import { CoverageModelTestUtilities } from "@app/test/coverage-model.testutil";
import { PricingGroupService } from "./pricing-group.service";

describe("PricingGroupService publishing",
    () => {
        let coverages: Coverage[];
        let pricingGroup: PricingGroup;
        let pricingGroupService: PricingGroupService;
        let leadLimitValues: any;
        let leadExcessValues: any;

        beforeEach(() => TestBed.configureTestingModule({
            providers: [
                PricingGroupService
            ]
        })
        );

        beforeEach(() => {
            coverages = CoverageModelTestUtilities.getTestCoverageList();
            pricingGroup = getPricingGroup();
            leadLimitValues = {};
            leadExcessValues = {};
        });

        beforeEach(inject([PricingGroupService], (pg: PricingGroupService) =>
        {
            pricingGroupService = pg;
        }));

        describe("SetPricingGroupSteps", () => {
            it("should return a limitLead and excessLead",
                () => {
                    pricingGroupService.addQuotedLimitExcessValuesToSliders(pricingGroup,
                        coverages,
                        leadLimitValues,
                        leadExcessValues);

                    expect(leadLimitValues[pricingGroup.pricingGroupId]).toBe(12345);
                    expect(leadExcessValues[pricingGroup.pricingGroupId]).toBe(123);

                });

            it("should return the excessSteps have a min", () => {
                pricingGroupService.addQuotedLimitExcessValuesToSliders(pricingGroup,
                    coverages,
                    leadLimitValues,
                    leadExcessValues);
                expect(pricingGroup.pricingGroupExcessSteps[0]).toBe(pricingGroup.minExcess);
            });

            it("should return the excessSteps as multiplied values", () => {
                pricingGroupService.addQuotedLimitExcessValuesToSliders(pricingGroup,
                    coverages,
                    leadLimitValues,
                    leadExcessValues);

                expect(pricingGroup.pricingGroupExcessSteps[0]).toBe(pricingGroup.minExcess);
                expect(pricingGroup.pricingGroupExcessSteps[1]).toBe(0.50 * 123);
                expect(pricingGroup.pricingGroupExcessSteps[2]).toBe(1 * 123);
                expect(pricingGroup.pricingGroupExcessSteps[3]).toBe(2 * 123);
                expect(pricingGroup.pricingGroupExcessSteps[4]).toBe(3 * 123);
                expect(pricingGroup.pricingGroupExcessSteps[5]).toBe(4 * 123);
            });

        });

        function getPricingGroup() {
            const pricingGroup = {
                pricingGroupId: 1,
                productId: 15,
                title: "Test",
                minLimit: 1000,
                maxLimit: 10000000.00,
                minExcess: 0,
                maxExcess: 250000.00,
                pricingGroupLimitSteps:
                    [
                        100000.00,
                        250000.00,
                        500000.00,
                        1000000.00,
                        2000000.00,
                        3000000.00,
                        4000000.00,
                        5000000.00,
                        7000000.00,
                        10000000.00
                    ],
                pricingGroupExcessSteps:
                    [
                        0.00,
                        0.50,
                        1.00,
                        2.00,
                        3.00,
                        4.00
                    ],
                pricingGroupLimitExcessLeaders: [
                    {
                        pricingGroupLimitExcessLeadId: 1,
                        pricingGroupId: 1,
                        wordingVersionId: 1,
                        leadLimitCode: "DOCRFTL1",
                        leadExcessCode: "DOCRFTD1"
                    }
                ]
            };

            return pricingGroup as PricingGroup;
        }

    });
