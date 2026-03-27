import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { EmailContact } from "@app/models";
import { ContactField } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";

@Component({
    selector: "app-contact-field",
    templateUrl: "./contact-field.component.html",
})
export class ContactFieldComponent implements OnInit {

    @Input()
    formGroup: FormGroup;

    @Input()
    config: ContactField;

    public contactOptions: EmailContact[];
    public displayName = (contact: EmailContact) => contact ? contact.name : "";
    public dropDownDisplay = (contact: EmailContact) => contact ? `${contact.name} (${contact.email})` : "";

    constructor(private formCreatorService: FormCreatorService) { }

    ngOnInit() {
        this.formCreatorService.contactsChanged.subscribe((contacts) => {
            if (contacts) {
                this.contactOptions = contacts;
            }
        });

        this.formCreatorService.emailTemplateChanged.subscribe((emailTemplate) => {
            if (emailTemplate) {
                const userFromTemplate = emailTemplate[this.config.templateProperty];
                const userObject = this.extractUser(userFromTemplate);
                let users = this.adjustUserFieldValue();

                if (userObject.length > 0) {
                    users = users.concat(userObject);
                }

                if (users !== this.formGroup.get(this.config.property).value) {
                    this.formGroup.get(this.config.property).setValue(users);
                }
            }
        });
    }

    private adjustUserFieldValue() {
        return this.formGroup.get(this.config.property).value === null
            ? []
            : this.formGroup.get(this.config.property).value;
    }

    private extractUser(userFromTemplate) {
        let userObject = [];
        if (userFromTemplate) {
            userObject = userFromTemplate.length > 0
                ? [
                    Object.assign(new EmailContact(), {
                        firstName: userFromTemplate[0].firstName,
                        lastName: userFromTemplate[0].lastName,
                        email: userFromTemplate[0].email
                    })
                ]
                : [];
        }

        return userObject;
    }
}
