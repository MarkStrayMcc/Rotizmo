import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Constants } from "@app/constants/constants";
import { PaymentPeriod } from "@app/enums/PaymentPeriod";

@Injectable({
	providedIn: "root",
})
export class PaymentService {
    private readonly _paymentPeriodRules = { country: Constants.ausIsoCode, product: Constants.cpmProductCode, brokerGroupId: Constants.gsaBrokerGroupId };

	private _paymentPeriod = new BehaviorSubject<string>(PaymentPeriod.Annual);

    public get paymentPeriodRules(): PaymentPeriodRule {
		return this._paymentPeriodRules;
	}


	public setPaymentPeriod(isPaymentPeriodValue: string): void {
		this._paymentPeriod.next(isPaymentPeriodValue);
	}

	public getPaymentPeriod(): Observable<string> {
		return this._paymentPeriod.asObservable();
	}
}

export interface PaymentPeriodRule {
	country: string;
	product: string;
    brokerGroupId: number;
}
