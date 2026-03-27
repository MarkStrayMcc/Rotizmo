import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@app/services/config.service';
import { BaseService } from '@app/services/base.service';
import { catchError } from 'rxjs/operators';
import { MessageResult, DropDownItem } from '@app/models';
import { RunDetail } from '../models/run-detail';

@Injectable({
  providedIn: 'root'
})

export class BulkQuotingService extends BaseService {

    private readonly defaultPageNumber = 1;
    private readonly defaultPageSize = 20;

    constructor(http: HttpClient, private configService: ConfigService) {
      super(http);
    }

    getUploadHistory(pageNumber = this.defaultPageNumber, pageSize = this.defaultPageSize) : Observable<any> {

      const url: string = this.configService.bulkQuotingUrl + `/runs`;

      return this.http.get(url, {
        observe: "response",
        params: new HttpParams()
          .set('pageNumber', pageNumber.toString())
          .set('pageSize', pageSize.toString())
      }).pipe(catchError(this.handleErrorObservable));
    }

    uploadBulkQuotes(model: any): Observable<MessageResult | any> {

    const url: string = this.configService.bulkQuotingUrl + `/upload-file`;
    const body = model;
    const options = this.commonHttpHeaders(null);

      return this.http.post(url, body, options)
          .pipe(catchError(this.handleErrorObservable));
    }

    public getBrokers(): Observable<DropDownItem[] | any> {

    const url: string = this.configService.bulkQuotingUrl + `/brokercompanies`;

      return this.http.get(url)
        .pipe(catchError(this.handleErrorObservable));
    }

    public getRunDetails(runId: number): Observable<RunDetail | any> {
      const url: string = this.configService.bulkQuotingUrl + `/runs/${runId}`;

      return this.http.get(url)
          .pipe(catchError(this.handleErrorObservable));
    }

    reportUrl(runId: number) {
      return this.configService.bulkQuotingUrl + `/runs/${runId}/report`;
    }
}
