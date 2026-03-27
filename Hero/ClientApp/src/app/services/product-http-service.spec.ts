import { async } from "@angular/core/testing";
import { inject, TestBed } from "@angular/core/testing";
import { RequestMethod, Response, ResponseOptions, XHRBackend } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { getTestQuote } from "../../test-helpers/index";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ProductHttpService } from "@app/services/product-http.service";
import { Product } from "@app/models/auto-generated/Product";

describe("ProductHttpService", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend
                },
                ProductHttpService
            ],
            imports: [HttpClientTestingModule]
        });
    }));

    it("Should be created",
        inject([XHRBackend, ProductHttpService], (service: ProductHttpService) => {
            expect(service).toBeTruthy();
        })
    );

    it("Should call HTTP GET once to get product",
        inject([XHRBackend, ProductHttpService],
            (mockBackend: MockBackend, productHttpService: ProductHttpService) => {
                // Actors
                let connectionCount = 0;
                const productId = "1";


                mockBackend.connections.subscribe(
                    (connection: MockConnection) => {
                        // Asserts
                        expect(connection.request.method).toBe(RequestMethod.Get);
                        expect(connection.request.url).toBe(`/product/getbyId`);

                        connectionCount++;

                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(getTestProduct()),
                            status: 200
                        })));
                    });

                // Actions
                productHttpService.getById(productId).subscribe(
                    (product: Product[]) =>
                    // Asserts
                    {
                        expect(product.length).toBe(1);
                        expect(product[0].productName).toBe("Cyber");
                        expect(product[0].productId).toBe(1);
                        expect(product[0].isAdmitted).toBeTruthy();
                        expect(connectionCount).toBe(1);
                    });
            })
    );

    it("Should call HTTP GET once to get is activity search enabled",
        inject([XHRBackend, ProductHttpService],
            (mockBackend: MockBackend, productHttpService: ProductHttpService) => {
                // Actors
                let connectionCount = 0;
                const productId = "1";


                mockBackend.connections.subscribe(
                    (connection: MockConnection) => {
                        // Asserts
                        expect(connection.request.method).toBe(RequestMethod.Get);
                        expect(connection.request.url).toBe(`/product/isActivitySearchEnabled`);

                        connectionCount++;

                        connection.mockRespond(new Response(new ResponseOptions({
                            body: JSON.stringify(getTestIsActivitySearchEnabled()),
                            status: 200
                        })));
                    });

                // Actions
                productHttpService.isSearchableProduct(productId).subscribe(
                    (product: boolean) =>
                    // Asserts
                    {
                        expect(product).toBeTruthy();
                        expect(connectionCount).toBe(1);
                    });
            })
    );
    function getTestProduct() {
        return [
            {
                productId: 1,
                productName: "Cyber",
                isAdmitted: true
            }
        ] as Product[];
    }

    function getTestIsActivitySearchEnabled() {
        return true;
    }
});
