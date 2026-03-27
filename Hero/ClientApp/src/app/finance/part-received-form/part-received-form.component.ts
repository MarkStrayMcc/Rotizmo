import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Carrier, CfcBankAccount, Currency } from "@app/models";
import { FormGroup } from "@angular/forms";
import { CfcBankAccountCurrency } from "@finance/shared/cfc-bank-account-currency";

@Component({
  selector: "app-part-received-form",
  templateUrl: "./part-received-form.component.html",
  styleUrls: ["./part-received-form.component.css"]
})
export class PartReceivedFormComponent implements OnInit {
  @Input() public paidFormGroup: FormGroup;
  @Input() public cfcBankAccounts: Observable<CfcBankAccount[]>;
  @Input() public carriers: Carrier[];
  @Input() public isLoadingCarriers: boolean;
  @Input() public supportedCurrencyCodes: CfcBankAccountCurrency[];
  @Input() public selectedCurrency: CfcBankAccountCurrency;
  @Input() public pendingPaymentRequestCurrency: Currency;

  constructor() {}

  ngOnInit() {}
}
