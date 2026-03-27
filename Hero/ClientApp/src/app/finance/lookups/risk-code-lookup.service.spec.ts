import { TestBed } from "@angular/core/testing";

import { BinderSectionLookup } from "@app/models";
import { RiskCodeLookupService } from "@app/finance/lookups/risk-code-lookup.service";

describe("RiskCodeLookupService", () => {
    let service: RiskCodeLookupService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RiskCodeLookupService
            ]
        });
        
        service = TestBed.inject(RiskCodeLookupService);
    });

    it("getData returns empty array when called without parameter", () => {
        // arrange
        let result: Array<string> = null;

        // act
        service.getData().subscribe(data => result = data);

        // assert
        expect(result).toBeDefined();
        expect(result.length).toEqual(0);
    });

    it("getData returns correct risk codes if called with binder as parameter", () => {
        // arrange
        let result: Array<string> = null;
        const binder = new BinderSectionLookup();
        binder.binderId = 12;
        binder.allowedLloydsRiskCodes = [
            "riskcode1",
            "riskcode2",
            "riskcode3"
        ];

        // act
        service.getData(binder).subscribe(data => result = data);

        // assert
        expect(result).toBeDefined();
        expect(result.length).toEqual(3);
        expect(result[1]).toEqual("riskcode2");
    });
});
