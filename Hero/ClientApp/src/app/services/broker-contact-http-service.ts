import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BrokerGroup } from '@app/models';
import { BrokerInformationResponse } from "@app/quote/models/Brokers/BrokerInformationResponse";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class BrokerContactHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getBrokerContact(brokerContactId: number, includeFullBrokerDetails: boolean = false): Observable<BrokerInformationResponse | any> {
        let url: string = `/brokercontact/getbrokercontact/${brokerContactId}?includeFullBrokerDetails=${includeFullBrokerDetails}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getBrokerGroup(brokerGroupId: number): Observable<BrokerGroup | any> {
        let url: string = `/brokergroup/${brokerGroupId}`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
