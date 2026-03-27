import { TestBed } from "@angular/core/testing";
import { ClientLocation } from "@app/models";
import { LocationHttpService } from "@app/services/location-http.service";
import { of } from "rxjs";
import { first } from "rxjs/operators";
import { InsuredAddressService } from "./insured-address.service";

describe("InsuredAddressService", () => {
    let insuredAddressService: InsuredAddressService;

    let mockLocationHttpService: LocationHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                InsuredAddressService,
                { provide: LocationHttpService, useValue: { getMainData: () => of([]) } }
            ]
        });

        insuredAddressService = TestBed.inject(InsuredAddressService);

        mockLocationHttpService = TestBed.inject(LocationHttpService);
    });

    it("should create service", () => {
        expect(insuredAddressService).toBeTruthy();
    });

    describe("get", () => {
        it("should get insured addresses by clientId", async () => {
            // Arrange
            const expectedClientId = 8;
            spyOn(mockLocationHttpService, "getMainData").and.returnValue(of([]));

            // Act
            await insuredAddressService.get(expectedClientId).pipe(first()).toPromise();
    
            // Assert
            expect(mockLocationHttpService.getMainData).toHaveBeenCalledTimes(1);
            expect(mockLocationHttpService.getMainData).toHaveBeenCalledWith(expectedClientId);
        });

        it("should set insured address to retrieved insured addresses", async () => {
            // Arrange
            const expectedInsuredAddresses = [<ClientLocation>{ clientLocationId: 11, address1: "test" }];
            spyOn(mockLocationHttpService, "getMainData").and.returnValue(of(expectedInsuredAddresses));

            // Act
            await insuredAddressService.get(5).pipe(first()).toPromise();
    
            // Assert
            const insuredAddresses = await insuredAddressService.insuredAddresses$.pipe(first()).toPromise();
            expect(insuredAddresses).toEqual(expectedInsuredAddresses);
        });
    });

    describe("select", () => {
        it("should add insured address ID to list of selected addresses", async () => {
            // Arrange
            const expectedClientLocationId1 = 25;
            const expectedClientLocationId2 = 13;
            const expectedClientLocationId3 = 94;

            // Act
            insuredAddressService.select(expectedClientLocationId1);
            insuredAddressService.select(expectedClientLocationId3);
            insuredAddressService.select(expectedClientLocationId2);
    
            // Assert
            const selectedClientLocationIds = await insuredAddressService.selectedClientLocationIds$.pipe(first()).toPromise();
            
            expect(selectedClientLocationIds.length).toBe(3);
            expect(selectedClientLocationIds).toContain(expectedClientLocationId1);
            expect(selectedClientLocationIds).toContain(expectedClientLocationId2);
            expect(selectedClientLocationIds).toContain(expectedClientLocationId3);
        });
    });

    describe("unselect", () => {
        it("should remove insured address ID from list of selected addresses", async () => {
            // Arrange
            const expectedClientLocationId1 = 25;
            const expectedClientLocationId2 = 13;
            const expectedClientLocationId3 = 94;

            insuredAddressService.select(expectedClientLocationId1);
            insuredAddressService.select(expectedClientLocationId3);
            insuredAddressService.select(expectedClientLocationId2);

            // Act
            insuredAddressService.unselect(expectedClientLocationId2);
    
            // Assert
            const selectedClientLocationIds = await insuredAddressService.selectedClientLocationIds$.pipe(first()).toPromise();
            
            expect(selectedClientLocationIds.length).toBe(2);
            expect(selectedClientLocationIds).toContain(expectedClientLocationId1);
            expect(selectedClientLocationIds).toContain(expectedClientLocationId3);
            expect(selectedClientLocationIds).not.toContain(expectedClientLocationId2);
        });
    });
});
