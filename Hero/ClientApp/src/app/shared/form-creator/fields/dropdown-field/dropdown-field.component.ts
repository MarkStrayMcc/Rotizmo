import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { DropDownField } from "@app/shared/form-creator/form-creator.config";
import { DropDownFieldService } from "@app/shared/services/dropdown-field.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-dropdown-field",
  templateUrl: "./dropdown-field.component.html"
})
export class DropDownFieldComponent implements OnInit, OnDestroy {

  @Input()
  formGroup: FormGroup;

  @Input()
  config: DropDownField;

  @Input()
  item: any;

  public objectKeys = Object.keys;
  public fieldErrors = {};

  private readonly errorText = {};
  private readonly _destroyed$ = new Subject<void>();

  constructor(
    public dropDownFieldService: DropDownFieldService
  ) { }

  ngOnInit() {
    if (this.config.validators) {
      this.config.validators.map((singleValidator) => this.errorText[singleValidator.selector] = singleValidator.message);
    }

    this.validateField();
    
    this.formGroup.get(this.config.property).valueChanges
      .pipe(takeUntil(this._destroyed$))
      .subscribe(this.validateField);

    if (this.config.requestData && this.config.serverFiltering) {
      this.config.requestData = this.dropDownFieldService.optionList;
    }
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  private validateField() {
    if (this.formGroup.get(this.config.property).errors) {
      let errors = Object.keys(this.formGroup.get(this.config.property).errors);
      errors.map((error) => this.fieldErrors[error] = this.getValidationMessage(error))
    }
  }

  private getValidationMessage = (validatorSelector) => this.config.validators.find(validator => validator.selector === validatorSelector).message
}
