import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { CheckBoxField } from "@app/shared/form-creator/form-creator.config";

@Component({
  selector: "app-checkbox-field",
  templateUrl: "./checkbox-field.component.html"
})
export class CheckboxFieldComponent {

  @Input()
  formGroup: FormGroup;

  @Input()
  config: CheckBoxField;

  @Input()
  item: any;
}
