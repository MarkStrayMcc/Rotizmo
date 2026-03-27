import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Currency } from "@app/models";

import { CurrencyHttpService } from "./currency-http.service";

describe("CurrencyHttpService", () => {
    let service: CurrencyHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CurrencyHttpService]
        });

        service = TestBed.inject(CurrencyHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    describe("getCurrencies", () => {
        it("should GET currencies, cache the response and return currencies", () => {
            // Arrange
            const expectedCurrencies = [<Currency>{ id: 2, isoCode: "USD", symbol: "$" }];

            service.getCurrencies().subscribe(currencies => expect(currencies).toBe(expectedCurrencies), fail);
            service.getCurrencies().subscribe(() => {}, fail);

            const request = httpMock.expectOne(`/currency/currencies`);

            // Act
            request.flush(expectedCurrencies);

            // Assert
            expect(request.request.method).toBe("GET");
        });
    });
});
