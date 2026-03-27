/* tslint:disable:max-classes-per-file */
import {CurrencyService} from "@app/quote/services/currency.service";
import {FakeCurrencyHttpService} from "@app/quote/services/currency-http.service.mock";
import { of } from 'rxjs';
import {Currency} from "@app/models";

describe('EnquiryService', () => {
    let currencyService: CurrencyService;
    let currencyHttpService = new FakeCurrencyHttpService(null);

    beforeEach(() => {
        currencyService = new CurrencyService(currencyHttpService);
    });

    it('should create CurrencyService', () => {
        expect(currencyService).toBeTruthy();
    });

    it('should return currency rate for a given ISO code', () => {
        let isoCode = "USD";
        let expectedRate = "1";
        spyOn<any>(currencyHttpService, "getCurrencyRateByIsoCode")
            .and.callFake(function () {
                return of(expectedRate);
        });

        // Act
        let resultObservable = currencyService.getCurrencyRateByIsoCode(isoCode);

        // Assert
        resultObservable.subscribe(result => {
            expect(result).toEqual(expectedRate);
        });
    });

    it('should return a currency object for a given ISO code', () => {
        let expectedCurrency: Currency = FakeCurrencyHttpService.UsdCurrency;
        let isoCode = expectedCurrency.isoCode;

        // act
        let resultObservable = currencyService.getCurrencyByIsoCode(isoCode);

        // assert
        resultObservable.subscribe(result => {
            expect(result).toEqual(expectedCurrency);
        });
    });

    it('should return undefined when the ISO code did not match a known currency', () => {
        let isoCode = "DOES-NOT-EXIST";

        // act
        let resultObservable = currencyService.getCurrencyByIsoCode(isoCode);

        // assert
        resultObservable.subscribe(result => {
            expect(result).toBeUndefined();
        });
    });
});
