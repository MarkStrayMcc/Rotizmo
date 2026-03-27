import { BaseService } from './base.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class MarketTypesHttpService extends BaseService {
    
    constructor(http: HttpClient) {
        super(http);
    }

    private marketTypesApiUrl = "marketType/markettypes";

    public getMarketTypes(): Observable<string | any> {
        return this.http.get(this.marketTypesApiUrl)
            .pipe(
                catchError(this.handleErrorObservable)
            );
    }
    
}