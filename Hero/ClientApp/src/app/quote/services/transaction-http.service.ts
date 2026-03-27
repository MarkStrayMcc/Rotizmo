import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Memoize } from "@app/shared/decorators/memoize.decorator";
import { Observable, of } from "rxjs";
import { catchError, shareReplay } from "rxjs/operators";
import { Transaction } from "../models/Transaction";

@Injectable({ providedIn: "root" })
export class TransactionHttpService extends BaseService {
	constructor(protected readonly http: HttpClient) {
		super(http);
	}

	@Memoize()
	public getTransactionsByPolicyNumber(policyNumber: string): Observable<Transaction[]> {
		const url: string = `/transactions/policyNumber/${policyNumber}`;
		return this.http.get<Transaction[]>(url).pipe(catchError(this.catchNotFoundError), shareReplay(1));
	}

	private catchNotFoundError = (error: any): Observable<any> => {
		if (error.status === 404) {
			return of(null);
		}

		return this.handleErrorObservable(error);
	};
}
