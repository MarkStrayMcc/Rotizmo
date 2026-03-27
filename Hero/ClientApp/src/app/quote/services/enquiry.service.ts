import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {EnquiryHttpService} from '@app/services/enquiry-http-service';
import {EnquirySearchResponse} from '@app/models/auto-generated/EnquirySearchResponse';
import {map} from 'rxjs/operators';
import {NerdEnquiry} from "@app/quote/models/enquiry/NerdEnquiry";
import {Enquiry} from "@app/quote/models/enquiry/Enquiry";
import {Guid} from "guid-typescript";
import {EnquiryServiceEnquiry} from "@app/quote/models/enquiry/EnquiryServiceEnquiry";

@Injectable()
export class EnquiryService {
    constructor(
        private readonly enquiryHttpService: EnquiryHttpService
    ) { }

    public getEnquiryById(enquiryId: number): Observable<Enquiry> {
        return this.enquiryHttpService.getEnquiryById(enquiryId).pipe(
            map(nerdEnquiry => EnquiryService.mapNerdEnquiryModelToHeroEnquiryModel(nerdEnquiry)));
    }

    private static mapNerdEnquiryModelToHeroEnquiryModel(nerdEnquiry: NerdEnquiry): Enquiry {
        return {
            expiringPolicyNumber: nerdEnquiry.expiringPolicyNumber,
            id: undefined,
            metaData: undefined,
            nerdVersion: nerdEnquiry.nerdVersion,
            riskData: undefined,
            enquiryReference: nerdEnquiry.id
        };
    }

    public getEnquiryByUid(enquiryUid: Guid): Observable<Enquiry> {
        return this.enquiryHttpService.getEnquiryByUid(enquiryUid).pipe(
            map(enquiryServiceEnquiry => EnquiryService.mapEnquiryServiceEnquiryModelToHeroEnquiryModel(enquiryServiceEnquiry))
        );
    }

    private static mapEnquiryServiceEnquiryModelToHeroEnquiryModel(enquiryServiceEnquiry: EnquiryServiceEnquiry): Enquiry {
        if(!enquiryServiceEnquiry) {
            return;
        }

        return {
            expiringPolicyNumber: enquiryServiceEnquiry.expiringPolicyNumber,
            id: enquiryServiceEnquiry.id,
            metaData: enquiryServiceEnquiry.metaData,
            nerdVersion: undefined,
            riskData: enquiryServiceEnquiry.riskData,
            enquiryReference: enquiryServiceEnquiry.enquiryReference
        };
    }

    public enquiriesSearch(clientId: number, cfcTeamName: string): Observable<EnquirySearchResponse> {
        return this.enquiryHttpService.enquiriesSearch(clientId, cfcTeamName);
    }
}
