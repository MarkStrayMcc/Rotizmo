import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { BlastZoneHttpService } from './blast-zone-http.service';
import { PropertyLimit } from '@app/quote/models/property-limit.model';
import { PropertyLimitBlastZoneCapacityRequest } from '@app/models/property-limit-blast-zone-capacity-request';
import { PropertyLimitBlastZoneCapacityResponse } from '@app/models/property-limit-blast-zone-capacity-response';
import { BlastZoneReservationGetResponse } from '@app/models/blast-zone-get-response';

describe("BlastZoneHttpService", () => {
    let service: BlastZoneHttpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [BlastZoneHttpService]
        });

        service = TestBed.inject(BlastZoneHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create service", () => {
        expect(service).toBeTruthy();
    });

    it("should return true with property limit list and blast zone reservation reference when all client locations have blast zone capacity", () => {
        // Arrange
        const propertyLimits: PropertyLimit[] = [{
            propertyLimitId: 1,
            propertyDamageLimit: 1000,
            contentsDamageLimit: 1000,
            actualLossSustainedLimit: 1000,
            increasedCostOfWorkingLimit: 1000,
            lossOfRentLimit: 1000,
            alternativeAccommodationLimit: 1000,
            insuredAddress: {
                countryId: 1,
                clientLocationId: 1,
                clientId: 1,
                address1: "address1",
                address2: "address2",
                address3: "address3",
                city: "city",
                postcode: "postcode",
                isPrimaryLocation: true,
                stateProvinceCode: "stateProvinceCode",
                county: "county",
                disabledOn: new Date(),
                country: null
            },
            totalInsuredValue: 6000,
        }];

        const propertyLimitBlastZoneCapacityRequest: PropertyLimitBlastZoneCapacityRequest = {
            propertyLimits: propertyLimits,
            inceptionDate: new Date('2024-01-01'),
            expiryDate: new Date('2025-01-01'),
            reservationExpiryDate: new Date('2025-12-01'),
            binderSectionId: 1289,
            quoteCurrencyIsoCode: "USD",
        };

        service.createBlastZoneReservation(propertyLimitBlastZoneCapacityRequest)
            .subscribe((result: { blastZoneCheckResult: boolean; propertyLimits: PropertyLimit[] }) => {
                expect(result.blastZoneCheckResult).toBe(false);
                expect(result.propertyLimits.length).toEqual(propertyLimits.length);
                expect(result.propertyLimits[0].blastZoneReservationId).toEqual('1231231');
            });

        const request = httpMock.expectOne(`blast-zone/create-reservation`);

        // Act
        request.flush({ blastZoneCheckResult: false, propertyLimits: [{ ...propertyLimits, blastZoneReservationId: '1231231' }] });

        // Assert
        expect(request.request.method).toBe("POST");
        expect(request.request.body.binderSectionId).toBe(1289);
        expect(request.request.body.quoteCurrencyIsoCode).toBe("USD");
    });

    it("should return false with property limit list when any client location has insufficient blast zone capacity", () => {
        // Arrange
        const propertyLimits: PropertyLimit[] = [{
            propertyLimitId: 1,
            propertyDamageLimit: 1000,
            contentsDamageLimit: 1000,
            actualLossSustainedLimit: 1000,
            increasedCostOfWorkingLimit: 1000,
            lossOfRentLimit: 1000,
            alternativeAccommodationLimit: 1000,
            insuredAddress: {
                countryId: 1,
                clientLocationId: 1,
                clientId: 1,
                address1: "address1",
                address2: "address2",
                address3: "address3",
                city: "city",
                postcode: "postcode",
                isPrimaryLocation: true,
                stateProvinceCode: "stateProvinceCode",
                county: "county",
                disabledOn: new Date(),
                country: null
            },
            totalInsuredValue: 6000,
        }];

        const propertyLimitBlastZoneCapacityRequest: PropertyLimitBlastZoneCapacityRequest = {
            propertyLimits: propertyLimits,
            inceptionDate: new Date('2024-01-01'),
            expiryDate: new Date('2025-01-01'),
            reservationExpiryDate: new Date('2025-12-01'),
            isRenewable : false
        };

        service.createBlastZoneReservation(propertyLimitBlastZoneCapacityRequest)
               .subscribe((result: PropertyLimitBlastZoneCapacityResponse) => {
                     expect(result.blastZoneCheckResult).toBe(false);
                     expect(result.propertyLimits).toEqual(propertyLimits);
               });

        const request = httpMock.expectOne(`blast-zone/create-reservation`);

        // Act
        request.flush({ blastZoneCheckResult: false, propertyLimits: propertyLimits });

        // Assert
        expect(request.request.method).toBe("POST");
    });

    it("should return blast zone details if there is a blast zone reservation for quote", () => {
        // Arrange
        const blastZoneReservationGetResponse: BlastZoneReservationGetResponse = {
            Id: "5a21c109-d482-46af-85c2-b080ca67031e",
            ClientId: "client-id",
            IsRenewable: false,
            ReservationExpiryDate: "2025-12-01",
            CapacityStartDate: "2024-01-01",
            CapacityEndDate: "2025-01-01",
            FirstLossLimit: 1000000,
            FloatingValue: 0.0,
            Reservations: [
                {
                    Id: "5a21c109-d482-46af-85c2-b080ca67031e",
                    Location: {
                        Latitude: 51.51261,
                        Longitude: -0.084134
                    },
                    Exposure: 100000000
                }
            ]
        };

        service.getBlastZoneDetails("5a21c109-d482-46af-85c2-b080ca67031e")
            .subscribe((result: BlastZoneReservationGetResponse) => {
                expect(result).toEqual(blastZoneReservationGetResponse);
            });

        const request = httpMock.expectOne(`blast-zone/get-blast-zone-reservation/5a21c109-d482-46af-85c2-b080ca67031e`);

        // Act
        request.flush(blastZoneReservationGetResponse);

        // Assert
        expect(request.request.method).toBe("GET");
    });

    it("Should delete blast zone reservation for quote", () => {
        // Arrange
        const blastZoneGroupId = "5a21c109-d482-46af-85c2-b080ca67031e";

        service.deleteBlastZoneReservation(blastZoneGroupId)
            .subscribe((result: boolean) => {
                expect(result).toBe(true);
            });

        const request = httpMock.expectOne(`blast-zone/delete-blast-zone-reservation/${blastZoneGroupId}`);

        // Act
        request.flush(true);

        // Assert
        expect(request.request.method).toBe("DELETE");
    });

    describe("updateBlastZoneReservation", () => {
        it("should return response when all client locations have blast zone capacity", () => {
            // Arrange
            const propertyLimitBlastZoneCapacityRequest: PropertyLimitBlastZoneCapacityRequest = {
                propertyLimits: [],
                inceptionDate: new Date('2024-01-01'),
                expiryDate: new Date('2025-01-01'),
                isRenewable: false,
                binderSectionId: 1289,
                quoteCurrencyIsoCode: "USD"
            };

            service.updateBlastZoneReservation(propertyLimitBlastZoneCapacityRequest)
                .subscribe((updateResult: PropertyLimitBlastZoneCapacityResponse) => {
                    expect(updateResult.blastZoneCheckResult).toBe(true);
                    expect(updateResult.propertyLimits).toEqual([]);
                }, fail);

            const request = httpMock.expectOne(`blast-zone/update-reservation`);

            // Act
            request.flush({ blastZoneCheckResult: true, propertyLimits: [] });

            // Assert
            expect(request.request.method).toBe("PUT");
            expect(request.request.body.binderSectionId).toBe(1289);
            expect(request.request.body.quoteCurrencyIsoCode).toBe("USD");
        });

        it("should return response when any client location has insufficient blast zone capacity", () => {
            // Arrange
            const propertyLimitBlastZoneCapacityRequest: PropertyLimitBlastZoneCapacityRequest = {
                propertyLimits: [],
                inceptionDate: new Date('2024-01-01'),
                expiryDate: new Date('2025-01-01'),
                isRenewable : false,
                binderSectionId: 1400,
                quoteCurrencyIsoCode: "CAD"
            };

            service.updateBlastZoneReservation(propertyLimitBlastZoneCapacityRequest)
                .subscribe((updateResult: PropertyLimitBlastZoneCapacityResponse) => {
                    expect(updateResult.blastZoneCheckResult).toBe(false);
                    expect(updateResult.propertyLimits).toEqual([]);
                }, fail);

            const request = httpMock.expectOne(`blast-zone/update-reservation`);

            // Act
            request.flush({ blastZoneCheckResult: false, propertyLimits: [] });

            // Assert
            expect(request.request.method).toBe("PUT");
            expect(request.request.body.binderSectionId).toBe(1400);
            expect(request.request.body.quoteCurrencyIsoCode).toBe("CAD");
        });
    });
});
