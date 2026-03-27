import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { LossPayeeMtaRequest } from "@app/models/auto-generated/LossPayeeMtaRequest";
import { AdditionalInsuredMtaRequest } from "@app/policy/models/AdditionalInsuredMtaRequest";
import { AddressChangeMtaRequest } from "@app/policy/models/AddressChangeMtaRequest";
import { CancellationMtaRequest } from "@app/policy/models/CancellationMtaRequest";
import { ManualChangeMtaRequest } from "@app/policy/models/ManualMtaRequest";
import { NameChangeMtaRequest } from "@app/policy/models/NameChangeMtaRequest";
import { BaseService } from "@app/services/base.service";
import { UserService } from "@app/services/user.service";
import { Observable } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { GetCancellationPremiumResponse } from "../models/GetCancellationPremiumResponse";
import { MtaResult } from "../models/MtaResult";
import { MtaSelectionConfig, MtaSelectionType } from "../mta/mta-selection.config";

@Injectable({ providedIn: "root" })
export class MtaService extends BaseService {
	private readonly policyApi = "/api/policy/";
	private readonly mtaApi = "/Mta/";

	constructor(protected readonly http: HttpClient, private readonly userService: UserService) {
		super(http);
	}

	public getAllAvailableMtaOptions(): Observable<MtaSelectionType[]> {
		let availableOptions = this.userService.getData().pipe(
			map(() => {
				return MtaSelectionConfig.mtaTypes.filter((mt) => {
					return this.userService.isFeatureAccessible(mt.featureName) || !mt.featureName;
				});
			})
		);
		return availableOptions;
	}

	public postAdditionalInsuredMta(policyNumber: string, request: AdditionalInsuredMtaRequest): Observable<MtaResult> {
		let url = `${this.policyApi}${policyNumber}/additional-insured`;

		if (!this.userService.isFeatureAccessible("heroAdditionalInsuredMtaV2")) {
			url = `${this.mtaApi}AdditionalInsured/${policyNumber}`;
		}

		return this.http.post<MtaResult>(url, request).pipe(catchError(this.handleErrorObservable));
	}

	public AddressChange(newAddress: AddressChangeMtaRequest): Observable<AddressChangeMtaRequest | any> {
		const url = `${this.mtaApi}AddressChange/${newAddress.policyNumber}`;
		newAddress = this.parseModel(newAddress);
		const options = this.commonHttpHeaders(null);
		return this.http.post(url, newAddress, options).pipe(catchError(this.handleErrorObservable));
	}

	public postLossPayeeMta(newLossPayee: LossPayeeMtaRequest, policyNumber: string): Observable<MtaResult | any> {
		let url = `${this.policyApi}${policyNumber}/loss-payees`;
		if (!this.userService.isFeatureAccessible("heroLossPayeeMtaV2")) {
			url = `${this.mtaApi}LossPayee/${policyNumber}`;
		}

		return this.http.post(url, newLossPayee, { responseType: "text" }).pipe(
			catchError(this.handleErrorObservable),
			map((mtaId) => <MtaResult>{ mtaId })
		);
	}

	public postNameChangeMta(newNameRequest: NameChangeMtaRequest): Observable<MtaResult | any> {
		const url = `${this.mtaApi}NameChange/${newNameRequest.policyNumber}`;
		const options = this.commonHttpHeaders(null);
		return this.http.post(url, newNameRequest, options).pipe(catchError(this.handleErrorObservable));
	}

	public postCancellation(request: CancellationMtaRequest, policyNumber: string): Observable<MtaResult> {
		let url = `${this.policyApi}${policyNumber}/cancellation`;

		if (!this.userService.isFeatureAccessible("heroCancellationMtaV2")) {
			url = `${this.mtaApi}Cancellation/${policyNumber}`;
		}

		return this.http.post(url, request, { responseType: "text" }).pipe(
			catchError(this.handleErrorObservable),
			map((mtaId) => <MtaResult>{ mtaId })
		);
	}

	public postManualChangeMta = (policyNumber: string, request: ManualChangeMtaRequest): Observable<MtaResult> => {
		let url = `${this.policyApi}${policyNumber}/mta/manual`;

		if (!this.userService.isFeatureAccessible("heroManualChangeMtaV2")) {
			url = `${this.mtaApi}ManualChangeMta/${policyNumber}`;
		}

		return this.http.post(url, request, { responseType: "text" }).pipe(
			catchError(this.handleErrorObservable),
			map((mtaId) => <MtaResult>{ mtaId })
		);
	};

	public getCancellationPremium(policyNumber: string, effectiveDate?: Date): Observable<GetCancellationPremiumResponse> {
		let url = `${this.mtaApi}CancellationPremium/${policyNumber}`;

		if (this.userService.isFeatureAccessible("heroManualChangeMtaV2")) {
			url = `${this.policyApi}${policyNumber}/cancellation/premium?effectiveDate=${effectiveDate.toISOString()}`;
		}

		return this.http.get<GetCancellationPremiumResponse>(url);
	}

	public getManualMtaTypes(policyNumber: string): Observable<number[]> {
		let url = `${this.policyApi}${policyNumber}/mta/manual/types`;

		if (!this.userService.isFeatureAccessible("heroManualChangeMtaV2")) {
			url = `${this.mtaApi}GetManualChangeMtaTypes/${policyNumber}`;
		}

		return this.http.get<number[]>(url);
	}

	private parseModel(model: any): AddressChangeMtaRequest {
		model.policyNumber = model.policyNumber;
		return model;
	}
}
