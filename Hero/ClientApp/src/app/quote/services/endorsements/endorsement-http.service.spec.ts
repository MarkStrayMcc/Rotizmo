import { HttpEvent, HttpEventType } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { InsuranceBasis, Document, OriginSystem } from "@app/models";
import { AutoAttachingEndorsementsRequest } from "@app/quote/models/endorsements/AutoAttachingEndorsementsRequest";
import { AvailableEndorsementsRequest } from "@app/quote/models/endorsements/AvailableEndorsementsRequest";
import { EndorsementHttpService } from "@app/quote/services/endorsements/endorsement-http.service";

describe("EndorsementHttpService", () => {
    let httpMock: HttpTestingController;
    let endorsementHttpService: EndorsementHttpService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [EndorsementHttpService],
            imports: [HttpClientTestingModule]
        });

        endorsementHttpService = TestBed.inject(EndorsementHttpService);
        httpMock = TestBed.inject(HttpTestingController);
    }));

    it("#getAvailable should call endpoint and send the correct data", () => {
        const availableEndorsementsRequest: AvailableEndorsementsRequest = {
            productCode: 'CPM',
            countryCode: 'US',
            stateCode: 'NY',
            brokerTeamId: 1,
            brokerId: 1,
            brokerGroupId: 1,
            businessLineCodes: [],
            insuringClauseCodes: [],
            insuringClauseSectionCodes: [],
            activityCodes: [],
            languageCode: 'en',
            wordingVersionId: 3,
            riskQuestionAnswers: { "TOTAL_REVENUE": "1000000" },
            documentBasisType: InsuranceBasis.Primary,
            originSystem: OriginSystem.Hero,
            coverHolder: "CFC Underwriting"
        };

        let document = new Document();
        document.createdBy = 1;
        document.title = 'test';
        const response = [document];

        endorsementHttpService.getAvailable(availableEndorsementsRequest).subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.body).toEqual(response);
            }
        });

        const mockReq = httpMock.expectOne(`/endorsement/getavailableendorsements`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("POST");
        expect(mockReq.request.body).toEqual(availableEndorsementsRequest);
        mockReq.flush(response);

        httpMock.verify();
    });

    it("#getAutoAttaching should call endpoint and send the correct data", () => {
        let document = new Document();
        document.createdBy = 1;
        document.title = 'test';
        const response = [document];

        const autoAttachingEndorsementsRequest: AutoAttachingEndorsementsRequest = {
            productCode: 'CPM',
            countryCode: 'US',
            stateCode: 'NY',
            brokerTeamId: 1,
            brokerId: 1,
            brokerGroupId: 1,
            businessLineCodes: [],
            insuringClauseCodes: [],
            insuringClauseSectionCodes: [],
            activityCodes: [],
            hasSubjectivities: true,
            languageCode: 'en',
            wordingVersionId: 3,
            riskQuestionAnswers: { "TOTAL_REVENUE": "1000000" },
            documentBasisType: InsuranceBasis.Primary,
            originSystem: OriginSystem.Hero,
            coverHolder: "CFC Underwriting"
        };

        endorsementHttpService.getAutoAttaching(autoAttachingEndorsementsRequest).subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.body).toEqual(response);
            }
        });

        const mockReq = httpMock.expectOne(`/endorsement/getautoattachingendorsements`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("POST");
        expect(mockReq.request.body).toEqual(autoAttachingEndorsementsRequest);
        mockReq.flush(response);

        httpMock.verify();
    });
});
