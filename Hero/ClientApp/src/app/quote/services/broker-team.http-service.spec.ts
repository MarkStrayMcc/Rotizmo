import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { BrokerTeam } from "@app/models";

import { BrokerTeamHttpService } from "./broker-team.http-service";

describe("BrokerTeamHttpService", () => {
    let service: BrokerTeamHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [BrokerTeamHttpService]
        });

        service = TestBed.inject(BrokerTeamHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    describe("get", () => {
        it("should GET and return the broker teams limits by country ISO codes", () => {
            // Arrange
            const expectedCountryIsoCodes = ["NZ", "IL"];
            const expectedBrokerTeams = [<BrokerTeam>{ id: 12 }];

            service.get(expectedCountryIsoCodes).subscribe(brokerTeams => {
                expect(brokerTeams).toBe(expectedBrokerTeams);
            }, fail);

            const request = httpMock.expectOne(`/broker-teams?countryIsoCode=${expectedCountryIsoCodes.join("&countryIsoCode=")}`);

            // Act
            request.flush(expectedBrokerTeams);

            // Assert
            expect(request.request.method).toBe("GET");
        });

        it("should cache the response based on the request", () => {
            // Arrange
            const parameter1 = ["US"];
            const parameter2 = ["CA"];

            // Act
            service.get(parameter1).subscribe(() => {}, fail);
            service.get(parameter1).subscribe(() => {}, fail);
            service.get(parameter2).subscribe(() => {}, fail);

            // Assert
            httpMock.expectOne(`/broker-teams?countryIsoCode=${parameter1.join("&countryIsoCode=")}`);
            httpMock.expectOne(`/broker-teams?countryIsoCode=${parameter2.join("&countryIsoCode=")}`);

            expect().nothing();
        });
    });
});
