import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseService } from "@app/services/base.service";
import { CfcBankAccount, PaymentRequest } from "@app/models";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";

@Injectable()
export class CfcBankAccountService extends BaseService {
    private cash: string = "cash";
    private call: string = "call";
    private nonLossFund: string = "non loss fund";
    private lossFund: string = "loss fund";
    private tpaBankAccountName = "24159607";
    private tpaUSBankAccountName = "889001146";
    private tpaClassificationId = 14;

    constructor(http: HttpClient) {
        super(http);
    }

    public getBankAccounts(): Observable<CfcBankAccount[] | any> {
        const url = `cfcbankaccount/cfcbankaccounts`;
        return this.http.get(url)
            .pipe(
                catchError(this.handleErrorObservable));
    }

    public getSuggestedAccount(accounts: CfcBankAccount[], paymentRequest: PaymentRequest): CfcBankAccount {
        let suggestedAccount = accounts[0];
        let isCashCall = true;
        if (paymentRequest && paymentRequest.paymentType) {
            let paymentType = paymentRequest.paymentType.toLowerCase();
            isCashCall = paymentType.indexOf(this.cash) >= 0 && paymentType.indexOf(this.call) >= 0;
        }

        if (paymentRequest.classification.classificationId === this.tpaClassificationId) {
            for (let i = 0; i < accounts.length; i++) {
                if (this.isCfcUsaTeam(paymentRequest) && (accounts[i].bankAccountName === this.tpaUSBankAccountName)) { 
                    return accounts[i];
                } else if (!this.isCfcUsaTeam(paymentRequest) && (accounts[i].bankAccountName === this.tpaBankAccountName)){
                        return accounts[i];             
                }
            }
        }

        for (let i = 0; i < accounts.length; i++) {
            let account = accounts[i];
            let bankAccountType = account.bankAccountType.toLowerCase();

            if (paymentRequest.currency &&
                account.bankAccountCurrencyId == paymentRequest.currency.id &&
                // if cash call, check that bank account is non loss
                ((isCashCall &&
                    bankAccountType.indexOf(this.nonLossFund) >= 0) ||
                // if not cash call, use loss fund
                (!isCashCall &&
                    bankAccountType.indexOf(this.lossFund) >= 0 &&
                    bankAccountType.indexOf(this.nonLossFund) < 0
                ))) {
                suggestedAccount = account;
                break;
            }
        }

        return suggestedAccount;
    }

    public isCfcUsaTeam(paymentRequest: PaymentRequest) {
        return (paymentRequest.binderSection.coverholder === "CFC USA");
    }
}
