import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BaseService } from "./base.service";
import { Observable } from 'rxjs';
import { Product } from '@app/models';
import { Memoize } from "@app/shared/decorators/memoize.decorator";
import { catchError } from 'rxjs/operators';

@Injectable()
export class ProductHttpService extends BaseService {
    constructor(http: HttpClient) {
        super(http);
    }

    public getById(productId: string): Observable<Product | any> {
        let url: string = `/product/getbyId?productId=${productId}`;

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    @Memoize()
    public isSearchableProduct(productCode: string): Observable<boolean | any> {
        let url: string = `/product/isActivitySearchEnabled?productCode=${encodeURIComponent(productCode)}`;

        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }
}
