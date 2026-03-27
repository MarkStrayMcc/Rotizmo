import { Injectable } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { InsuranceBasis, Document, OriginSystem } from "@app/models";
import { AutoAttachingEndorsementsRequest } from "@app/quote/models/endorsements/AutoAttachingEndorsementsRequest";
import { AvailableEndorsementsRequest } from "@app/quote/models/endorsements/AvailableEndorsementsRequest";
import { EndorsementHttpService } from "@app/quote/services/endorsements/endorsement-http.service";
import { of } from "rxjs";
import { EndorsementService } from "./endorsement.service";

describe("EndorsementService", () => {
    let endorsementService: EndorsementService;
    let endorsementHttpService: EndorsementHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                EndorsementService,
                {
                    provide: EndorsementHttpService,
                    useClass: MockEndorsementHttpService,
                },
            ],
        });

        endorsementService = TestBed.inject(EndorsementService);
        endorsementHttpService = TestBed.inject(EndorsementHttpService);
    });

    it("should create", () => {
        expect(endorsementService).toBeTruthy();
    });

    it("should get a list of available endorsements", async () => {
        const getAvailableEndorsementsResponse = await endorsementService
            .getAvailable(availableEndorsementsRequestStub)
            .toPromise();
        expect(getAvailableEndorsementsResponse).toEqual([documentMock]);
    });

    it("should get a list of auto attaching endorsements", async () => {
        const getAutoAttachingEndorsementsResponse = await endorsementService
            .getAutoAttaching(autoAttachingEndorsementsRequest)
            .toPromise();
        expect(getAutoAttachingEndorsementsResponse).toEqual([documentMock]);
    });
});

const documentMock = new Document();
documentMock.createdBy = 1;
documentMock.title = "test";

const availableEndorsementsRequestStub: AvailableEndorsementsRequest = {
    productCode: "CPM",
    countryCode: "US",
    stateCode: "NY",
    brokerTeamId: 1,
    brokerId: 1,
    brokerGroupId: 1,
    businessLineCodes: [],
    insuringClauseCodes: [],
    insuringClauseSectionCodes: [],
    activityCodes: [],
    languageCode: "en",
    wordingVersionId: 3,
    riskQuestionAnswers: { "TOTAL_REVENUE": "1000000" },
    documentBasisType: InsuranceBasis.Primary,
    originSystem: OriginSystem.Hero,
    coverHolder: "CFC Underwriting"
};

const autoAttachingEndorsementsRequest: AutoAttachingEndorsementsRequest = {
    productCode: "CPM",
    countryCode: "US",
    stateCode: "NY",
    brokerTeamId: 1,
    brokerId: 1,
    brokerGroupId: 1,
    businessLineCodes: [],
    insuringClauseCodes: [],
    insuringClauseSectionCodes: [],
    activityCodes: [],
    languageCode: "en",
    hasSubjectivities: false,
    wordingVersionId: 3,
    riskQuestionAnswers: { "TOTAL_REVENUE": "1000000" },
    documentBasisType: InsuranceBasis.Primary,
    originSystem: OriginSystem.Hero,
    coverHolder: "CFC Underwriting"
};

@Injectable()
export class MockEndorsementHttpService {
    getAvailable = () => of([documentMock]);
    getAutoAttaching = () => of([documentMock]);
}
