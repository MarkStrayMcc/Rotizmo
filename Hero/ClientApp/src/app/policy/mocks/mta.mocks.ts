import {Component, EventEmitter, Input, Output} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { mockCfcContact } from "@app/mocks/cfc-contact.mock";
import { CfcContact, Country } from "@app/models";
import { InterestOfEntity } from "@app/models/InterestOfEntity";
import { DropDownField, FormButton, FormButtonTypes, FormConfig, FormItem } from "@app/shared/form-creator/form-creator.config";
import { DateValidators } from "@app/validators/date.validators";
import * as moment from "moment";
import { of } from "rxjs";
import { ICancellationPremium } from "../mta/popups/mta-ab-initio-cancellation/ICancellationPremium";

export const mockUserProfile: CfcContact = mockCfcContact;

export const mockMtaEmailTemplate = {
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

export const mockUserServiceTest = {
    getUser: jasmine.createSpy(),
    isFeatureAccessible: () => true
};

export const mockFormButton = new FormButton({
    cssClass: "name-change-submit md-mr2",
    property: "name-change-save",
    label: "Save",
    type: FormButtonTypes.Submit,
    disable: true
});

export const mockDateValidators = [
    Validators.required,
    DateValidators.min(moment(new Date('Fri May 28 2021 00:00:00'))),
    DateValidators.max(moment(new Date('Wed Jun 23 2021 00:00:00')))
];

export const mockFormGroup: FormGroup = new FormGroup({
    effectiveDate: new FormControl(""),
    changeType: new FormControl("PolicyReissue")
});


export const mockManualMtaFormGroupWithDateValidator: FormGroup = new FormGroup({
    effectiveDate: new FormControl("", mockDateValidators),
    manualChangeType: new FormControl("Extension", Validators.required),
    description: new FormControl()
});

export const mockCancellationFormGroup: FormGroup = new FormGroup({
    effectiveDate: new FormControl("effectiveDate"),
    changeType: new FormControl("changeType"),
    returnFee: new FormControl("returnFee"),
    totalReturnPremium: new FormControl("totalReturnPremium"),
    returnTax: new FormControl("returnTax"),
    cancellationReason: new FormControl("cancellationReason")
});

export const mockMtaForm: FormItem = {
    selector: "test",
    form: mockFormGroup,
    buttons: [mockFormButton]
} as FormItem;

export const mockManualMtaForm: FormItem = {
    selector: "test",
    form: mockManualMtaFormGroupWithDateValidator,
    buttons: [mockFormButton]
} as FormItem;

export const mockCancellationMtaForm: FormItem = {
    selector: "mta-cancellation",
    form: mockCancellationFormGroup,
    buttons: [mockFormButton]
} as FormItem;

export const mockAdditionalInsuredFormButton = new FormButton({
    cssClass: "additional-insured-add md-mr2",
    property: "additional-insured-add",
    label: "Add",
    type: FormButtonTypes.Submit,
    disable: true
});

export const mockAdditionalInsuredMtaForm: FormItem = {
    selector: "test",
    form: mockFormGroup,
    buttons: [mockAdditionalInsuredFormButton]
} as FormItem;

export const mockLossPayeeFormButton = new FormButton({
    cssClass: "loss-payee-add md-mr2",
    property: "loss-payee-add",
    label: "Add",
    type: FormButtonTypes.Submit,
    disable: true
});

export const mockLossPayeeMtaForm: FormItem = {
    selector: "test",
    form: mockFormGroup,
    buttons: [mockLossPayeeFormButton]
} as FormItem;

export const mockFormCreatorService = {
    setForm: jasmine.createSpy(),
    setButtonClicked: jasmine.createSpy(),
    formInstance: of(mockMtaForm),
    buttonClicked: of("name-change-send"),
};

export const mockManualMtaFormCreatorService = {
    setForm: jasmine.createSpy(),
    setButtonClicked: jasmine.createSpy(),
    formInstance: of(mockManualMtaForm),
    buttonClicked: of("manual-mta-save"),
};

export const mockCancellationFormCreatorService = {
    setForm: jasmine.createSpy(),
    setButtonClicked: jasmine.createSpy(),
    formInstance: of(mockCancellationMtaForm),
    buttonClicked: of("cancellation-send"),
};

export const mockAdditionalInsuredFormCreatorService = {
    setForm: jasmine.createSpy(),
    setButtonClicked: jasmine.createSpy(),
    formInstance: of(mockAdditionalInsuredMtaForm),
    buttonClicked: of("additional-insured-send"),
};

export const mockLossPayeeFormCreatorService = {
    setForm: jasmine.createSpy(),
    setButtonClicked: jasmine.createSpy(),
    formInstance: of(mockLossPayeeMtaForm),
    buttonClicked: of("loss-payee-send"),
};


export const mockErrorMessageHandlerService = {
    handleError: jasmine.createSpy()
};

export class MockEmailContactService {
    getEmailContacts: () => ([[]]);
}

export const mockMessageService = {
    clearMessage: jasmine.createSpy(),
    clearAllMessages: jasmine.createSpy(),
    sendMessage: jasmine.createSpy(),
    getMessage: () => {

    }
};

export class MockUserService {
    public getUser() { return of(mockUserProfile); };
    public isFeatureAccessible = () => true;
}

export class MockFormCreatorService { }

export const mockReturnPremium: ICancellationPremium = {
    currencyIsoCode: "US",
    currencySymbol: "$",
    returnFee: 12900,
    taxRate: 0.12,
    totalReturnPremium: 200,
    totalTax: 1548
}

export const mockMtaHttpService = {
    postNameChangeMta: jasmine.createSpy(),
    postAdditionalInsuredMta: jasmine.createSpy(),
    postLossPayeeMta: jasmine.createSpy(),
    postCancellation: jasmine.createSpy(),
    getCancellationPremium: jasmine.createSpy().and.returnValue(of(mockReturnPremium))
};

export class MockMatDialogRef<T> {
    public close(dialogResult?: any): void { return; }
}

export class MockModalDialogService {
    public openDialog<T, TY>(obj) { return; }
}

export const mockDropDownService = {
    getCountries: jasmine.createSpy().and.returnValue(of(new Country))
};

@Component({ selector: "shared-form-creator", template: "" })
export class MockSharedFormCreatorComponent {
    form: FormGroup;
    @Input() item: any = {};
    @Input() config: FormConfig;
    @Output() validForm: EventEmitter<any> = new EventEmitter();
}

export const mockPolicyLossPayeeService = {
    getLossPayees: jasmine.createSpy()
};

export const mockAdditionalInsuredConfigBuilder = {
    setConfig: jasmine.createSpy()
};

export const mockLossPayeeConfigBuilder = {
    setConfig: jasmine.createSpy().and.returnValue(
        {
            groups: [
                {
                    fields: [
                        new DropDownField({
                            property: "interestOfEntity",
                            enum: InterestOfEntity,
                            value: ""
                        })
                    ]
                }
            ]
        })
};
