import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ContactDetails } from "./contact-details.model";
import { DirectBillingHttpService } from "./direct-billing.http-service";
import { Limit } from "./limit.model";

@Injectable({
	providedIn: "root",
})
export class DirectBillingService {
	private readonly _directBillingRules = [{ country: "US", products: ["CPA"] }, { country: "GB" }];
	private _isDirectBillingEnabled = new BehaviorSubject<boolean>(false);

	constructor(private directBillingHttpService: DirectBillingHttpService) {}

	public get directBillingRules(): DirectBillingRule[] {
		return this._directBillingRules;
	}

	public getPaymentLimit(countryCode: string): Observable<Limit> {
		return this.directBillingHttpService.getPaymentLimit(countryCode);
	}

	public getContactDetails(externalCustomerReference: string): Observable<ContactDetails> {
		return this.directBillingHttpService.getContactDetails(externalCustomerReference);
	}

	public setIsDirectBillingEnabled(isDirectBillingEnabled: boolean): void {
		this._isDirectBillingEnabled.next(isDirectBillingEnabled);
	}

	public getIsDirectBillingEnabled(): Observable<boolean> {
		return this._isDirectBillingEnabled.asObservable();
	}
}

export interface DirectBillingRule {
	country: string;
	products?: string[];
}
