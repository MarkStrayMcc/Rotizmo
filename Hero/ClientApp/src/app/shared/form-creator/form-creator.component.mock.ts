/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />

import { FormControl, FormGroup, Validators, Form } from "@angular/forms";
import { EmailTemplate, MessageCategory } from "@app/models";
import { of, Subscription, Observable } from "rxjs";
import { FormButton, FormButtonTypes, FormItem, FormField, FormType, TextBoxField, FieldValidator, FormConfig } from "./form-creator.config";
import { Input, Component } from '@angular/core';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

export const mockFormButton = new FormButton({
    cssClass: "send-email-button md-mr2",
    property: "send-email-button",
    label: "Send",
    type: FormButtonTypes.Submit,
    disable: true
});

export const mockFormGroup: FormGroup = new FormGroup({
    to: new FormControl([{ FirstName: "Malka", LastName: "Niazov", Email: "Malka@gurg.co.il", Name: "Malka Niazov" }]),
    template: new FormControl("")
});

export const mockSendEuDocumentsForm: FormItem = {
    selector: "test",
    form: mockFormGroup,
    buttons: [mockFormButton]
} as FormItem;

export const mockFormCreatorService = {
    setForm: of({}),
    setButtonClicked: of({}),
    formInstance: of(mockSendEuDocumentsForm),
    buttonClicked: of("send-email-button"),
    emailTemplateChanged: of({ subscribe: () => { } }),
    setEmailTemplate: () => { },
    setContacts: (template: EmailTemplate) => { }
};

export const mockMessageService = {
    clearMessage: jasmine.createSpy(),
    clearAllMessages: jasmine.createSpy(),
    sendMessage: jasmine.createSpy(),
    getMessage: () => {

    }
};

export const mockErrorMessageHandlerService = {
    handleError: jasmine.createSpy()
};

export const mockConfig: FormConfig = {
    title: "Mocked Form",
    selector: "mocked-form",
    fields: [
        new TextBoxField({
            cssClass: "mockedField1",
            label: "mockedField1",
            property: "mockedField1",
            validators: [
                new FieldValidator({
                    selector: "required",
                    message: "Required",
                    validator: Validators.required
                })
            ]
        }),
        new TextBoxField({
            cssClass: "mockedField2",
            label: "mockedField2",
            property: "mockedField2",
            validators: []
        }),
    ],
    buttons: [
        new FormButton({
            property: "mockedButton",
            cssClass: "mockedButton",
            label: "mockedButton",
            type: FormButtonTypes.Submit
        })
    ]
};

@Component({ selector: "message", template: "" })
export class MockMessageComponent {
    subscription: Subscription;
    lastMessage: Message;
    @Input() public category: MessageCategory;
}

@Component({ selector: "app-form-field-renderer", template: "" })
export class MockFormFieldRendererComponent {
    @Input() config: FormField;
    @Input() formGroup: FormGroup;
    @Input() item: any;
    @Input() selectedItem: any;
    @Input() isVisible: boolean;
    public errorText = {};
}

@Component({ selector: "mat-spinner", template: "" })
export class MockMatspinnerComponent {
    @Input() diameter: number;
}
