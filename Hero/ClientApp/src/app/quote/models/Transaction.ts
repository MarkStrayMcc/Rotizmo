import { Currency } from "@app/models";

export interface Transaction {
	transactionId: number;
	policyNumber: string;
	quoteId?: number;
	isDirectBilling?: boolean;
}
