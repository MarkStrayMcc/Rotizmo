import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { of } from "rxjs";

import { LossFundSummaryComponent } from "@app/finance/loss-fund-summary/loss-fund-summary.component";
import { LOSS_FUND_SUMMARY_COLUMNS } from "@app/finance/loss-fund-summary/loss-fund-summary.columns";
import { FinanceLossFundSummary } from "@app/models";

describe("loss-fund-summary component", () => {
    let component: LossFundSummaryComponent;
    let fixture: ComponentFixture<LossFundSummaryComponent>;

    let lossFunds: FinanceLossFundSummary;

    describe("Isolated Unit Tests",
        () => {
            const mockLossFundSummaryService =
                jasmine.createSpyObj("mockLossFundSummaryService", ["getLossFundSummaries", "getColumns", "getDefaultColumn"]);
            mockLossFundSummaryService.getLossFundSummaries.and.returnValue(of(lossFunds));
            mockLossFundSummaryService.getColumns.and.returnValue(LOSS_FUND_SUMMARY_COLUMNS);
            mockLossFundSummaryService.getDefaultColumn.and.returnValue({});
            const mockAppCommunicationService = jasmine.createSpyObj("mockAppCommunicationService", ["addClass"]);
            const mockTitleService = jasmine.createSpyObj("mockTitleService", ["setTitle", "getTitle"]);
            const component = new LossFundSummaryComponent(mockLossFundSummaryService,
                mockAppCommunicationService,
                mockTitleService
            );

            describe("ngOnInit", () => {
                component.ngOnInit();
                it("should have called CfcBankAccountHttpService.getLossFundSummaries",
                    () => {
                        expect(mockLossFundSummaryService.getLossFundSummaries).toHaveBeenCalled();
                    }
                );
            });
        });

});
