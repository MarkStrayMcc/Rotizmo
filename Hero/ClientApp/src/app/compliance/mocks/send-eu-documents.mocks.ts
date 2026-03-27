/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { Component, Input } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { mockCfcContact } from "@app/mocks/cfc-contact.mock";
import { CfcContact, EmailType, Client } from "@app/models";
import { FormButton, FormButtonTypes, FormConfig, FormItem } from "@app/shared/form-creator/form-creator.config";
import { of, Observable } from "rxjs";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { EmailTemplate } from "@app/models/auto-generated/EmailTemplate";
import { EmailContactService } from "@app/services/email-contact.service";
import { EmailContact } from "@app/models/auto-generated/EmailContact";
import { Params, Data, ActivatedRoute } from '@angular/router';

export const mockUserProfile = mockCfcContact;

export const mockEmailContact: EmailContact = {
    firstName: "Jack",
    lastName: "Pott",
    email: "jpott@cfcunderwriting.com",
    name: "Jack Pott"
};

export const mockUserData = of(mockCfcContact);

export const mockEmailTemplate = {
    subject: "21323223312321321 - MTA - Policy Num: FII0114826846",
    body: "",
    toContacts: [{ firstName: "Malka", lastName: "Niazov", email: "Malka@gurg.co.il", name: "Malka Niazov" }],
    ccContacts: [],
    bccContacts: [{ firstName: "Hannah", lastName: "Durrant", email: "hdurrant@cfcunderwriting.com", name: "Hanna Durrant" }],
    defaultAttachments: [
        {
            fileName: "NameChange_20200623120156.pdf",
            serverSideFileType: 8,
            reference: "FII0114826846"
        }
    ],
    mergeFields: {
        MtaType: "MTA",
        PolicyNumber: "FII0114826846",
        ChangeType: "Endorsement",
        ClientName: "21323223312321321"
    },
    emailType: "SendEmail"
};

export class SaveButton<FormButton> {
    public isExecuting = false;
    public disable = true;
    public label = "Save";
    public type = FormButtonTypes.Submit;
}

export class SendButton<FormButton> {
    public isExecuting = false;
    public disable = true;
    public label = "Send";
    public type = FormButtonTypes.Button;
};

export const mockFormButton = new FormButton({
    cssClass: "send-email-button md-mr2",
    property: "send-email-button",
    label: "Send",
    type: FormButtonTypes.Submit,
    disable: true
});

export const mockFormGroup = new FormGroup({
    to: new FormControl([{ FirstName: "Malka", LastName: "Niazov", Email: "Malka@gurg.co.il", Name: "Malka Niazov" }]),
    template: new FormControl(""),
    client: new FormControl("")
});

export const mockSendEuDocumentsForm: FormItem = {
    selector: "client",
    form: mockFormGroup,
    buttons: [mockFormButton]
};

export const mockFormCreatorService = {
    setForm: jasmine.createSpy(),
    setButtonClicked: jasmine.createSpy(),
    formInstance: of(mockSendEuDocumentsForm),
    buttonClicked: of("send-email-button"),
    emailTemplateChanged: of({ subscribe: () => { } }),
    setEmailTemplate: () => { },
    setContacts: (template: EmailTemplate) => { }
};

export const mockErrorMessageHandlerService = {
    handleError: jasmine.createSpy()
};

export const mockMessageService = {
    clearMessage: jasmine.createSpy(),
    clearAllMessages: jasmine.createSpy(),
    sendMessage: jasmine.createSpy(),
    getMessage: () => {

    }
};

export const mockUserService = {
    getData(): Observable<CfcContact> { return of(mockUserProfile); },
    getUser(): CfcContact {
        return mockUserProfile;
    }
};

export class MockActivatedRoute extends ActivatedRoute {
    constructor() {
        super();
        this.params = of({ template: "quote" });
    }
}

export const mockActivatedRoute = {
    snapshot: {
        queryParams: {
            template: "quote"
        }
    }
};

export const dropDownFieldService = {
    searchClient: jasmine.createSpy(),
};

export const clientHttpService = {
    searchClient(): Observable<Client | any> { return of([]); },
};

export class MockFormCreatorService { }

export const mockEmailContactService = {
    getEmailContacts(): Observable<EmailContact[]> {
        return of([mockEmailContact]) as Observable<EmailContact[]>;
    }
}

export const mockEuDocumentsHttpService = {
    sendEuDocuments: jasmine.createSpy(),
    getClient: jasmine.createSpy()
};

export const mockSendEmailRequest = {
    cfcUserId: "1dc86388-2e78-4caf-ab73-be46d9ae6749",
    policyNumber: "ESI0318041410",
    changeType: "PolicyReissue",
    effectiveDate: "2020-06-08T09:57:36.242Z",
    clientName: "Rodrigo Fante test",
};

export const mockEmailHttpService = {
    sendEmail: jasmine.createSpy(),
    getEmailTemplateForMta: jasmine.createSpy(),
    getEmailTemplate: (templateType: EmailType) => { return of({} as EmailTemplate); },
};

export const mockFileUploadService = {
    readFile: jasmine.createSpy()
};

export class MockMatDialogRef<T> {
    public close(dialogResult?: any): void { return; }
}

export const mockModalDialogService = {
    openDialog: jasmine.createSpy()
};

export const mockDropDownService = {
    getCountries: jasmine.createSpy()
};

@Component({ selector: "shared-form-creator", template: "" })
export class MockSharedFormCreatorComponent {
    form: FormGroup;
    @Input() item: any = {};
    @Input() config: FormConfig;
}
