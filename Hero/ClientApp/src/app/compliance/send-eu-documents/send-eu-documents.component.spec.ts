import { CommonModule } from "@angular/common";
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';
import * as sendEuDocumentsMocks from "@app/compliance/mocks/send-eu-documents.mocks";
import { EmailType } from "@app/enums/EmailType";
import { EmailTemplate } from "@app/models/auto-generated/EmailTemplate";
import { ClientHttpService } from "@app/services/client-http.service";
import { EmailContactService } from "@app/services/email-contact.service";
import { EmailHttpService } from "@app/services/email-http.service";
import { FileUploadService } from "@app/services/file-upload-service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { DropDownFieldService } from "@app/shared/services/dropdown-field.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { of } from "rxjs";
import { FormItem } from "../../shared/form-creator/form-creator.config";
import { EuDocumentsHttpService } from "../services/eu-documents-http.service";
import { SendEuDocumentsComponent } from "./send-eu-documents.component";

describe("SendEuDocumentsComponent", () => {
    let component: SendEuDocumentsComponent;
    let fixture: ComponentFixture<SendEuDocumentsComponent>;

    const testModuleConfiguration = {
        declarations: [
            SendEuDocumentsComponent,
            sendEuDocumentsMocks.MockSharedFormCreatorComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: [
            { provide: EuDocumentsHttpService, useValue: sendEuDocumentsMocks.mockEuDocumentsHttpService },
            { provide: EmailContactService, useValue: sendEuDocumentsMocks.mockEmailContactService },
            { provide: EmailHttpService, useValue: sendEuDocumentsMocks.mockEmailHttpService },
            { provide: FileUploadService, useValue: sendEuDocumentsMocks.mockFileUploadService },
            { provide: FormCreatorService, useValue: sendEuDocumentsMocks.mockFormCreatorService },
            { provide: MessageService, useValue: sendEuDocumentsMocks.mockMessageService },
            { provide: UserService, useValue: sendEuDocumentsMocks.mockUserService },
            { provide: DropDownFieldService, useValue: sendEuDocumentsMocks.dropDownFieldService },
            { provide: ClientHttpService, useValue: sendEuDocumentsMocks.clientHttpService },
            { provide: ActivatedRoute, useValue: sendEuDocumentsMocks.mockActivatedRoute }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(SendEuDocumentsComponent);
        component = fixture.componentInstance;

        component["sendButton"] = new sendEuDocumentsMocks.SendButton();
        component["sendButtonProperty"] = "send-email-button";
        component["sendEmailForm"] = sendEuDocumentsMocks.mockSendEuDocumentsForm;
    });

    it("should create SendEuDocumentsComponent component", fakeAsync(() => {
        expect(component).toBeDefined();
    }));

    it("should set the user profile on init", fakeAsync(() => {
        // Arrange
        component["setEmailContacts"] = () => { };

        // Act
        component.ngOnInit();
        flush();

        // Assert
        expect(component.user).toEqual(sendEuDocumentsMocks.mockUserProfile);
    }));

    it("should retrieve the contacts on init", fakeAsync(() => {
        // Arrange
        const mockEmailContactService = fixture.debugElement.injector.get(EmailContactService);
        spyOn(mockEmailContactService, "getEmailContacts").and.returnValue(of([sendEuDocumentsMocks.mockEmailContact]));

        // Act
        component.ngOnInit();
        flush();

        // Assert
        expect(mockEmailContactService.getEmailContacts).toHaveBeenCalledTimes(1);
    }));

    it("should set the contacts on init", fakeAsync(() => {
        // Arrange
        const mockFormCreatorService = fixture.debugElement.injector.get(FormCreatorService);
        spyOn(mockFormCreatorService, "setContacts");

        // Act
        component.ngOnInit();
        flush();

        // Assert
        expect(mockFormCreatorService.setContacts).toHaveBeenCalledTimes(1);
        expect(mockFormCreatorService.setContacts).toHaveBeenCalledWith([sendEuDocumentsMocks.mockEmailContact]);
    }));

    it("should load the 3 email templates", fakeAsync(() => {
        // Arrange
        component["templatesList"] = [];
        component["sendEmailForm"] = {} as FormItem;
        const mockEmailHttpService = fixture.debugElement.injector.get(EmailHttpService);
        spyOn(mockEmailHttpService, "getEmailTemplate").and.returnValue(of({} as EmailTemplate));

        // Act
        component.ngOnInit();
        tick(500);

        // Assert
        expect(mockEmailHttpService.getEmailTemplate).toHaveBeenCalledTimes(3);
        expect(mockEmailHttpService.getEmailTemplate).toHaveBeenCalledWith(EmailType.sendEuMta);
        expect(mockEmailHttpService.getEmailTemplate).toHaveBeenCalledWith(EmailType.sendEuPolicyManual);
        expect(mockEmailHttpService.getEmailTemplate).toHaveBeenCalledWith(EmailType.sendEuQuoteManual);
    }));

    it("should set jointTemplates ", fakeAsync(() => {
        // Arrange
        const mockEmailHttpService = fixture.debugElement.injector.get(EmailHttpService);
        spyOn(mockEmailHttpService, "getEmailTemplate").and.returnValue(of({} as EmailTemplate));

        // Act
        component.ngOnInit();
        flush();

        // Assert
        expect(component["jointTemplates"]).toBeDefined();
    }));

    it("should load the 3 email templates in a list", fakeAsync(() => {
        // Arrange
        component["templatesList"] = [];
        component["sendEmailForm"] = {} as FormItem;
        const mockEmailHttpService = fixture.debugElement.injector.get(EmailHttpService);
        spyOn(mockEmailHttpService, "getEmailTemplate").and.returnValue(of({} as EmailTemplate));

        // Act
        component.ngOnInit();
        flush();

        // Assert
        expect(component["templatesList"]).toBeDefined();
        expect(component["templatesList"].length).toBe(3);
    }));

    it("should update the form on change", () => {
        // Arrange
        component["sendEmailForm"] = {} as FormItem;

        // Act
        component.ngOnInit();

        // Assert
        expect(component["sendEmailForm"]).toBeDefined();
        expect(component["sendEmailForm"]).toBe(sendEuDocumentsMocks.mockSendEuDocumentsForm);
    });

    it("should set the template value as Quote", fakeAsync(() => {
        // Arrange
        component["templatesList"] = [];
        component["sendEmailForm"] = {} as FormItem;

        // Act
        component.ngOnInit();
        flush();

        // Assert
        expect(component["sendEmailForm"].form.get("template").value).toEqual("sendEuQuoteManual");
    }));

    it("should handle success send document", fakeAsync(() => {
        // Arrange
        component["sendButton"] = sendEuDocumentsMocks.mockFormButton;
        component["setEmailContacts"] = () => { };
        component["formatSendEuDocumentRequest"] = () => { };

        // Act
        component.ngOnInit();
        component.handleSendSuccess({});
        flush();

        // Asset
        fixture.detectChanges();
        expect(component["sendButton"].disable).toBeFalsy();
        expect(component["sendButton"].isExecuting).toBeFalsy();
    }));

    it("should handle error on sending a document", fakeAsync(() => {
        // Arrange
        component["sendButton"] = sendEuDocumentsMocks.mockFormButton;
        component["setEmailContacts"] = () => { };

        // Act
        component.ngOnInit();
        component.handleSendError({});
        flush();

        // Asset
        fixture.detectChanges();
        expect(component["sendButton"].disable).toBeFalsy();
        expect(component["sendButton"].isExecuting).toBeFalsy();
    }));
});
