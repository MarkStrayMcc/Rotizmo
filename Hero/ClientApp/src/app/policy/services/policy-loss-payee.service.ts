import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { LossPayee } from "@app/models/auto-generated/LossPayee";
import { UserService } from "@app/services/user.service";

@Injectable()
export class PolicyLossPayeeService extends BaseService {
	constructor(http: HttpClient, private _userService: UserService) {
		super(http);
	}

	public getLossPayees(policyNumber: string): Observable<LossPayee[] | any> {
		let url = `/api/policy/${policyNumber}/loss-payees`;

		if (!this._userService.isFeatureAccessible("heroLossPayeeMtaV2")) {
			url = `/policy/${policyNumber}/loss-payees`;
		}

		const options = this.commonHttpHeaders(null);
		return this.http.get(url, options).pipe(
			map((lossPayees: any[]) =>
				lossPayees.map((lossPayee: any) => {
					return lossPayee;
				}, catchError(this.handleErrorObservable))
			)
		);
	}
}
