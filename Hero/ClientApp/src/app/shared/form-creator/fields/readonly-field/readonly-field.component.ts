import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { DropDownField, ReadOnlyField } from "@app/shared/form-creator/form-creator.config";

@Component({
  selector: "app-readonly-field",
  styleUrls: ["readonly-field.component.scss"],
  templateUrl: "./readonly-field.component.html"
})
export class ReadOnlyFieldComponent {

  @Input()
  formGroup: FormGroup;

  @Input()
  config: ReadOnlyField;

  @Input()
  item: any;
}
