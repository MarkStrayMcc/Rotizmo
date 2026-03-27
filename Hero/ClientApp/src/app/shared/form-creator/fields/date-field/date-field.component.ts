import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { DateField } from "@app/shared/form-creator/form-creator.config";
import { FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";

@Component({
  selector: "app-date-field",
  templateUrl: "./date-field.component.html"
})
export class DateFieldComponent implements OnInit, OnDestroy {

  @Input()
  formGroup: FormGroup;

  @Input()
  config: DateField;

  @Input()
  item: any;

  private _dateField$: Subscription;

  public fieldErrors = {};

  constructor() { }

  ngOnInit() {
    this._dateField$ = this.formGroup.get(this.config.property).valueChanges.subscribe(field => {
      if (this.formGroup.get(this.config.property).errors) {
        let errors = Object.keys(this.formGroup.get(this.config.property).errors);
        errors.map((error) => this.fieldErrors[error] = this.getValidationMessage(error))
      }
    });
  }
  
  ngOnDestroy() {
    if (this._dateField$) {
      this._dateField$.unsubscribe();
    }
  }

  private getValidationMessage = (validatorSelector) => this.config.validators.find(validator => validator.selector === validatorSelector).message
}
