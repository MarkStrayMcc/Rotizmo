import { Transaction } from "./../models/Transaction";
import { BehaviorSubject, Observable, of } from "rxjs";
import { TransactionHttpService } from "./transaction-http.service";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";

@Injectable({
	providedIn: "root",
})
export class TransactionService {
	private _transactions: BehaviorSubject<Transaction[]> = new BehaviorSubject<Transaction[]>([]);
	isExpiringPolicyDirectBilling$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	constructor(private _transactionHppService: TransactionHttpService) {}

	public getTransactionsByPolicyNumber(policyNumber: string): Observable<Transaction[]> {
		const transactions$ = this._transactionHppService.getTransactionsByPolicyNumber(policyNumber).pipe(
			tap((transactions: Transaction[]) => {
				this._transactions.next(transactions);
				this.setIsDirectBilling(transactions);
			})
		);
		return transactions$;
	}

	private setIsDirectBilling(transactions: Transaction[]): void {
		this.isExpiringPolicyDirectBilling$.next(false);
		if (transactions && transactions.length > 0) {
			transactions.sort((a, b) => (b.transactionId > a.transactionId ? 1 : -1));
			const latestTransaction: Transaction = transactions[0];
			this.isExpiringPolicyDirectBilling$.next(!!latestTransaction.isDirectBilling);
		}
	}

	get isExpiringPolicyDirectBilling(): boolean {
		return this.isExpiringPolicyDirectBilling$.value;
	}
}
