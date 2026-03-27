import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { DropDownField } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Subscription } from 'rxjs';

@Component({
  selector: "app-textarea",
  templateUrl: "./text-area.component.html"
})
export class TextAreaFieldComponent implements OnInit, OnDestroy {

  @Input()
  formGroup: FormGroup;

  @Input()
  config: DropDownField;

  @Input()
  item: any;

  private objectKeys = Object.keys;
  private _field$: Subscription;
  private _form$: Subscription;

  public fieldErrors = {};

  constructor(public formCreatorService: FormCreatorService) { }

  ngOnInit() {
    this._form$ = this.formCreatorService.formInstance.subscribe(form => this.validateField())
    this._field$ = this.formGroup.get(this.config.property).valueChanges.subscribe(field => {
      this.validateField();
    });
  }

  ngOnDestroy() {
    if (this._field$) {
      this._field$.unsubscribe();
    }
    if (this._form$) {
      this._form$.unsubscribe();
    }
  }

  private validateField() {
    if (this.formGroup.get(this.config.property).errors) {
      let errors = Object.keys(this.formGroup.get(this.config.property).errors);
      errors.map((error) => this.fieldErrors[error] = this.getValidationMessage(error))
    }
  }

  private getValidationMessage(validatorSelector) {
    return this.config.validators.find(validator => validator.selector === validatorSelector).message;
  }
}
