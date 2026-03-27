import { HttpEvent, HttpEventType } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { ClientLocation } from "@app/models";
import { LocationHttpService } from "./location-http.service";

describe("LocationHttpService", () => {
    let httpMock: HttpTestingController;
    let locationHttpService: LocationHttpService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [LocationHttpService],
            imports: [HttpClientTestingModule]
        });
        locationHttpService = TestBed.inject(LocationHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    }));

    it("should retrieve a list of client locations", () => {
        locationHttpService.getMainData(1).subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
                    expect(responseEvent.body).toEqual(mockGetClientLocationsResponse);
            }
        });

        const mockReq = httpMock.expectOne(`/Location/GetClientLocations?clientId=1`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush(mockGetClientLocationsResponse);

        httpMock.verify();
    });
});

const mockGetClientLocationsResponse: ClientLocation[] = [
    {
        clientLocationId: 1394,
        clientId: 0,
        address1: "624 Parkvalley Road SE",
        address2: "",
        address3: "",
        city: "Calgary",
        countryId: 2,
        postcode: "T2J 4V8",
        isPrimaryLocation: false,
        stateProvinceCode: "AB",
        county: null,
        disabledOn: null,
        country: {
            countryId: 2,
            name: "Canada",
            isoCode: "CA",
            currency: {
                id: 4,
                name: "Canada Dollars",
                isoCode: "CAD",
                symbol: "$",
                rate: 1.721622
            }
        }
    },
    {
        clientLocationId: 18433,
        clientId: 0,
        address1: "Slough Trading Estate",
        address2: "",
        address3: "",
        city: "Slough",
        countryId: 1,
        postcode: "SL1 4AX",
        isPrimaryLocation: false,
        stateProvinceCode: "0",
        county: null,
        disabledOn: null,
        country: {
            countryId: 1,
            name: "UK",
            isoCode: "GB",
            currency: {
                id: 3,
                name: "United Kingdom Pounds",
                isoCode: "GBP",
                symbol: "£",
                rate: 1
            }
        }
    }];