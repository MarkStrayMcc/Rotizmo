import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";

import { Currency } from "@app/models";
import { CurrencyLookupService } from "@app/finance/lookups/currency-lookup.service";
import { CurrencyHttpService } from "@app/services/currency-http.service";

describe("CurrencyLookupService", () => {
    class MockCurrencyService {
        public getCurrencies(): Observable<Currency[]> {
            return of([
                createCurrencyLookup(1, "GBP"),
                createCurrencyLookup(2, "USD")
            ]);
        }
    }

    let service: CurrencyLookupService;
    let currencyService: CurrencyHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CurrencyLookupService,
                { provide: CurrencyHttpService, useClass: MockCurrencyService }
            ]
        });

        service = TestBed.inject(CurrencyLookupService);
        currencyService = TestBed.inject(CurrencyHttpService);
    });

    it("getData calls currencyService", () => {
        // arrange
        spyOn(currencyService, "getCurrencies").and.callThrough();

        // act
        service.getData().subscribe();

        // assert
        expect(currencyService.getCurrencies).toHaveBeenCalledTimes(1);
    });

    it("getData returns not filtered data if called without parameter", () => {
        // arrange
        let result: Array<Currency> = [];

        // act
        service.getData().subscribe(data => result = data);

        // assert
        expect(result.length).toEqual(2);
        expect(result[1].isoCode).toEqual("USD");
    });

    function createCurrencyLookup(id: number, isoCode: string) {
        const result = new Currency();
        result.id = id;
        result.isoCode = isoCode;
        return result;
    }
});
