import { Injectable } from "@angular/core";
import { fakeAsync, inject, TestBed } from "@angular/core/testing";
import { Quote, RiskQuestion, RiskQuestionOption } from "@app/models";
import { MockQuoteService } from "@app/quote/quote.component.mock";
import { QuoteService } from "@app/quote/services/quote.service";
import { RiskService } from "@app/services/risk-service";
import { TaxHttpService } from "@app/services/tax-http.service";
import { UserService } from "@app/services/user.service";
import { from, of } from "rxjs";
import { getTestQuote } from "../../../test-helpers/index";
import { GoodsAndServicesTaxService } from "./goods-and-services-tax.service";

describe("GoodsAndServicesTax.service", () => {
    let quote: Quote = null;
    let goodsAndServicesTaxService: GoodsAndServicesTaxService = null;
    let riskService: RiskService;
    let quoteService: QuoteService;

    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            GoodsAndServicesTaxService,
            { provide: TaxHttpService, useValue: { getGSTRate: () => from([0.1]) } },
            { provide: RiskService, useClass: MockRiskService },
            { provide: UserService, useClass: MockUserService },
            { provide: QuoteService, useClass: MockQuoteService }
        ]
    }));

    beforeEach(inject([GoodsAndServicesTaxService, RiskService, QuoteService], (ts, rs, qs) => {
        quote = getTestQuote();
        goodsAndServicesTaxService = ts;
        riskService = rs;
        quoteService = qs;
    }));

    describe("useGST", () => {
        it("Should return false with GST Registered", () => {
            // Arrange
            const riskQuestionAnswers = [{
                "id": 0,
                "quoteId": 0,
                "riskQuestionTag": "GST_Registered",
                "text": "Yes",
                "number": null,
                "percentage": null,
                "date": null,
                "currency": null,
                "riskQuestionOptionUid": "Ce73f08c-6466-4699-826c-e0ad71196d4a",
                "showOnStep": 0,
                "riskQuestionType": 3
            }];

            const yesRiskSelectOption = new RiskQuestionOption();
            yesRiskSelectOption.text = "Yes";
            yesRiskSelectOption.uid = "Ce73f08c-6466-4699-826c-e0ad71196d4a";

            const gstRegisteredRiskQuestion = new RiskQuestion();
            gstRegisteredRiskQuestion.tag = "GST_Registered";
            gstRegisteredRiskQuestion.options = [yesRiskSelectOption];

            spyOn(riskService, "getRiskQuestions").and.returnValue([gstRegisteredRiskQuestion]);
            quoteService.getRiskQuestionAnswers = jasmine.createSpy().and.returnValue(riskQuestionAnswers);

            // Act
            const result = goodsAndServicesTaxService.useGST(quote);

            // Assert
            expect(result).toBeFalsy();
        });

        it("Should return true when GST not Registered", () => {
            // Arrange
            const riskQuestionAnswers = [{
                "id": 0,
                "quoteId": 0,
                "riskQuestionTag": "GST_Registered",
                "text": "No",
                "number": null,
                "percentage": null,
                "date": null,
                "currency": null,
                "riskQuestionOptionUid": "Ce73f08c-6466-4699-826c-e0ad71196d4a",
                "showOnStep": 0,
                "riskQuestionType": 3
            }];

            const noRiskSelectOption = new RiskQuestionOption();
            noRiskSelectOption.text = "No";
            noRiskSelectOption.uid = "Ce73f08c-6466-4699-826c-e0ad71196d4a";

            const gstRegisteredRiskQuestion = new RiskQuestion();
            gstRegisteredRiskQuestion.tag = "GST_Registered";
            gstRegisteredRiskQuestion.options = [noRiskSelectOption];

            spyOn(riskService, "getRiskQuestions").and.returnValue([gstRegisteredRiskQuestion]);
            quoteService.getRiskQuestionAnswers = jasmine.createSpy().and.returnValue(riskQuestionAnswers);

            // Act
            const result = goodsAndServicesTaxService.useGST(quote);

            // Assert
            expect(result).toBeTruthy();
        });

        it("Should update GST rate when a quote property that is related to GST is changed", fakeAsync(() => {
            // Arrange
            goodsAndServicesTaxService.updateGSTRate = jasmine.createSpy("updateGSTRate");
            goodsAndServicesTaxService["quoteService"].propertyChanged$ = of({ type: "inceptionDate", payload: new Date() });

            // Act
            goodsAndServicesTaxService.gstUpdateHandler();

            //Act
            expect(goodsAndServicesTaxService.updateGSTRate).toHaveBeenCalled();
        }));
    });
});

@Injectable()
class MockTaxHttpService {
    public getGSTRate = () => from([0.1]);
}

// tslint:disable-next-line:max-classes-per-file
@Injectable()
class MockRiskService {
    public getRiskQuestions() { }
}

@Injectable()
class MockUserService {
    public isFeatureAccessible(): boolean { return true; }
}