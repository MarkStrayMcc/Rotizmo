import { Injectable } from "@angular/core";
import { inject, TestBed } from "@angular/core/testing";
import { EnquirySearchResult } from "@app/models";
import { EnquirySearchResponse } from "@app/models/auto-generated/EnquirySearchResponse";
import { EnquiryServiceEnquiry } from "@app/quote/models/enquiry/EnquiryServiceEnquiry";
import { NerdEnquiry } from "@app/quote/models/enquiry/NerdEnquiry";
import { EnquiryService } from "@app/quote/services/enquiry.service";
import { EnquiryHttpService } from "@app/services/enquiry-http-service";
import { Guid } from "guid-typescript";
import { Observable, of } from "rxjs";
import { first } from "rxjs/operators";

describe('EnquiryService', () => {
    let enquiryService: EnquiryService;
    let enquiryHttpService: EnquiryHttpService;

    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            EnquiryService,
            { provide: EnquiryHttpService, useClass: MockEnquiryHttpService }
        ]
    }));

    beforeEach(inject([EnquiryService, EnquiryHttpService], (es, ehs) => {
        enquiryService = es;
        enquiryHttpService = ehs;
    }));

    beforeEach(() => {
        spyOn(enquiryHttpService, "getEnquiryById").and.returnValue(of(mockNerdEnquiry));
        spyOn(enquiryHttpService, "getEnquiryByUid").and.returnValue(of(mockEnquiryServiceEnquiry));
        spyOn(enquiryHttpService, "enquiriesSearch").and.returnValue(of(mockEnquirySearchResponse));
    });

    it("Should be created", () => {
        expect(enquiryService).toBeTruthy();
    });

    describe("getEnquiryById", () => {
        it("Should return a mapped Enquiry for an integer enquiry ID", () => {
            // Act
            let enquiryObservable = enquiryService.getEnquiryById(1);

            // Assert
            enquiryObservable.subscribe(enquiry => {
                expect(enquiry.enquiryReference).toEqual(1);
                expect(enquiry.expiringPolicyNumber).toEqual("TEST");
                expect(enquiry.nerdVersion).toEqual(3);
                expect(enquiry.id).toEqual(undefined);
                expect(enquiry.metaData).toEqual(undefined);
                expect(enquiry.riskData).toEqual(undefined);
            });
        });
    });

    describe("getEnquiryByUid", () => {
        it("Should return a mapped Enquiry for a Guid enquiry ID", async () => {
            // Arrange
            const enquiryUid = Guid.parse('3B3A7FC5-A227-4EDC-A85F-5DC43B2CC887')

            // Act
            const enquiry = await enquiryService.getEnquiryByUid(enquiryUid).pipe(first()).toPromise();

            // Assert
            expect(enquiry.enquiryReference).toEqual(1);
            expect(enquiry.expiringPolicyNumber).toEqual("TEST");
            expect(enquiry.nerdVersion).toEqual(undefined);
            expect(enquiry.id).toEqual(enquiryUid);
            expect(enquiry.metaData).toEqual({ "applicationFormStyle": "CFC" });
            expect(enquiry.riskData).toEqual({ "totalHeadcount": 234, "currencyIsoCode": "GBP" });
        });
    });

    describe("enquiriesSearch", () => {
        it("Should return an EnquirySearchResponse for a client ID and team name", async () => {
            // Act
            const response = await enquiryService.enquiriesSearch(1, 'Team').pipe(first()).toPromise();

            // Assert
            expect(response.results[0].assignedUnderwriterInitials).toEqual('CWM');
            expect(response.results[0].brokerCompanyId).toEqual(1);
            expect(response.results[0].brokerCompanyName).toEqual('Test Broker Co.');
            expect(response.results[0].brokerContactId).toEqual(1);
            expect(response.results[0].brokerContactName).toEqual('Test Broker Contact');
            expect(response.results[0].brokerTeamId).toEqual(1);
            expect(response.results[0].brokerTeamName).toEqual('Test Broker Team');
            expect(response.results[0].enquiryId).toEqual(1);
            expect(response.results[0].enquiryReceivedDate).toEqual(undefined);
            expect(response.results[0].enquiryUid).toEqual('3B3A7FC5-A227-4EDC-A85F-5DC43B2CC887');
        });
    });

    const mockNerdEnquiry: NerdEnquiry = {
        id: 1,
        expiringPolicyNumber: "TEST",
        nerdVersion: 3
    };

    const mockEnquiryServiceEnquiry: EnquiryServiceEnquiry = {
        enquiryReference: 1,
        expiringPolicyNumber: "TEST",
        id: Guid.parse('3B3A7FC5-A227-4EDC-A85F-5DC43B2CC887'),
        metaData: { "applicationFormStyle": "CFC" },
        riskData: { "totalHeadcount": 234, "currencyIsoCode": "GBP" }
    };

    const enquirySearchResult: EnquirySearchResult = {
        assignedUnderwriterInitials: "CWM",
        brokerCompanyId: 1,
        brokerCompanyName: "Test Broker Co.",
        brokerContactId: 1,
        brokerContactName: "Test Broker Contact",
        brokerTeamId: 1,
        brokerTeamName: "Test Broker Team",
        enquiryId: 1,
        enquiryReceivedDate: undefined,
        enquiryUid: '3B3A7FC5-A227-4EDC-A85F-5DC43B2CC887'
    };

    const mockEnquirySearchResponse: EnquirySearchResponse = {
        results: [enquirySearchResult]
    };
});

@Injectable()
class MockEnquiryHttpService {
    public getEnquiryById(_: number): Observable<NerdEnquiry | any> {
        return of([null]);
    }

    public getEnquiryByUid(_: Guid): Observable<EnquiryServiceEnquiry | any> {
        return of([null]);
    }

    public enquiriesSearch(_: number, __: string): Observable<EnquirySearchResponse | any> {
        return of([null]);
    }
}
