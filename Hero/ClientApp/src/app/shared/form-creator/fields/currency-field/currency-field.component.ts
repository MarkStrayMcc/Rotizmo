import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { CurrencyField } from "@app/shared/form-creator/form-creator.config";
import { Subscription } from "rxjs";
import { ICurrency } from "../../ICurrency";

@Component({
  selector: "app-currency-field",
  templateUrl: "./currency-field.component.html"
})
export class CurrencyFieldComponent implements OnInit, OnDestroy {

  @Input()
  formGroup: FormGroup;

  @Input()
  config: CurrencyField;

  @Input()
  item: any;

  currency: ICurrency;
  currency$: Subscription;

  constructor( private cdref: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.config.currency) {
      this.currency$ = this.config.currency.subscribe(currency => {
        this.currency = currency;
        this.cdref.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    if (this.currency$) {
      this.currency$.unsubscribe();
    }
  }
}
