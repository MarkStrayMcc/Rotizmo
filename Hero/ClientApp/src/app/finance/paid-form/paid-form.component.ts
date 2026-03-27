import { Component, OnInit, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { CfcBankAccount, Currency } from "@app/models";
import { Observable } from "rxjs";
import { CfcBankAccountCurrency } from "@finance/shared/cfc-bank-account-currency";

@Component({
  selector: "app-paid-form",
  templateUrl: "./paid-form.component.html",
  styleUrls: ["./paid-form.component.css"]
})
export class PaidFormComponent implements OnInit {
  @Input() public paidFormGroup: FormGroup;
  @Input() public cfcBankAccounts: Observable<CfcBankAccount[]>;
  @Input() public supportedCurrencyCodes: CfcBankAccountCurrency[];
  @Input() public selectedCurrency: CfcBankAccountCurrency;
  @Input() public pendingPaymentRequestCurrency: Currency;

  constructor() {}

  ngOnInit() {}
}
