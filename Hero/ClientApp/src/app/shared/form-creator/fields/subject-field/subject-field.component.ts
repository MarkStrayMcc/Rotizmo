import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { SubjectField } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";

@Component({
  selector: "app-subject-field",
  templateUrl: "./subject-field.component.html",
})
export class SubjectFieldComponent implements OnInit {

  @Input()
  formGroup: FormGroup;

  @Input()
  config: SubjectField;

  constructor(private formCreatorService: FormCreatorService) { }

  ngOnInit() {
    this.formCreatorService.emailTemplateChanged.subscribe((emailTemplate) => {
      if (emailTemplate) {
        this.formGroup.get(this.config.property).setValue(emailTemplate[this.config.property]);
      }
    });
  }
}
