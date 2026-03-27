import { Component, Input } from "@angular/core";
import { FormField } from "@app/shared/form-creator/form-creator.config";

@Component({
  selector: "app-disabled-field-renderer",
  templateUrl: "./disabled-field-renderer.component.html"
})
export class DisabledFieldRendererComponent {

  @Input()
  field: FormField;

  @Input()
  item: any;

}
