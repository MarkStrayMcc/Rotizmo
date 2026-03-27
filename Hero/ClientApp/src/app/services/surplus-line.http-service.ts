
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '@app/services/base.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SurplusLine } from '@app/quote/models/SurplusLine';

@Injectable({ providedIn: 'root' })
export class SurplusLineHttpService extends BaseService {
    private readonly controllerBase = '/SurplusLine';

    constructor(protected readonly http: HttpClient) {
        super(http);
    }

    /**
     * GET /SurplusLine/resolve-for-renewal?expiringPolicyNumber=...
     * Returns the resolved SurplusLine or null if not found.
     * 404 (and optionally 204) are treated as "no match".
     */
    public resolveForRenewal(expiringPolicyNumber: string): Observable<SurplusLine | null> {
        if (!expiringPolicyNumber?.trim()) {
            return of(null);
        }

        const params = new HttpParams().set('expiringPolicyNumber', expiringPolicyNumber.trim());

        return this.http
            .get<SurplusLine>(`${this.controllerBase}/resolve-for-renewal`, { params, observe: 'response' })
            .pipe(
                map(resp => {
                    // Treat 204 (No Content) as no match
                    if (resp.status === 204 || resp.body == null) {
                        return null;
                    }

                    const body = resp.body as SurplusLine;
                    if ((body as any).expiryDate) {
                        (body as any).expiryDate = new Date((body as any).expiryDate);
                    }

                    return body;
                }),
                catchError(err => {
                    // Treat 404 as "no match"
                    if (err?.status === 404) {
                        return of<SurplusLine | null>(null);
                    }

                    // Delegate other errors to the base handler
                    return this.handleErrorObservable(err);
                })
            );
    }
}
