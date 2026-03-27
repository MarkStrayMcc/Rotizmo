import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormField } from "@app/shared/form-creator/form-creator.config";

@Component({
  selector: "app-form-field-renderer",
  templateUrl: "./form-field-renderer.component.html"
})
export class FormFieldRendererComponent implements OnInit {

  @Input()
  config: FormField;

  @Input()
  formGroup: FormGroup;

  @Input()
  item: any;

  @Input()
  selectedItem: any;

  @Input()
  isVisible: boolean;

  public errorText = {};

  ngOnInit() {
    if (this.config.validators) {
      this.config.validators.map((singleValidator) => this.errorText[singleValidator.selector] = singleValidator.message);
    }
  }
}
