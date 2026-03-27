/* tslint:disable:max-classes-per-file */
import { Component, forwardRef, Input } from "@angular/core";
import { ComponentFixture, inject, TestBed } from "@angular/core/testing";
import { ControlValueAccessor, FormBuilder, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { EuDocumentsHttpService } from "@app/compliance/services/eu-documents-http.service";
import {
    BrokerContact,
    CfcContact,
    Client,
    EmailTemplate,
    EmailType,
    FeatureAccess,
    MessageResult,
    Quote,
    ServerSideFileData
} from "@app/models";
import { CommissionInformation } from "@app/quote/models/pricing/CommissionInformation";
import { EmailContactService } from "@app/services/email-contact.service";
import { EmailHttpService } from "@app/services/email-http.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { FileUploadService } from "@app/services/file-upload-service";
import { MessageService } from "@app/services/message.service";
import { PolicyEmailHttpService } from "@app/services/policy-email-http.service";
import { QuoteEmailHttpService } from "@app/services/quote-email-http.service";
import { UserService } from "@app/services/user.service";
import { ErrorModule } from "@app/shared/error.module";
import { from, Observable } from "rxjs";
import { SendEmailModalComponent } from "./send-email-modal.component";
import { FeaturesHttpService } from '@app/services/features-http.service';
import { UnderwritingDistributionService } from '@app/services/underwriting-distribution.service';

describe("SendEmailModalComponent", () => {
    let fixture: ComponentFixture<SendEmailModalComponent>;
    let component: SendEmailModalComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                FormBuilder,
                { useClass: MockMatDialogRef, provide: MatDialogRef },
                { useClass: MockEmailHttpService, provide: EmailHttpService },
                { useClass: MockQuoteEmailHttpService, provide: QuoteEmailHttpService },
                { useClass: MockPolicyEmailHttpService, provide: PolicyEmailHttpService },
                { useClass: MockEmailContactService, provide: EmailContactService },
                { useClass: MockErrorMessageHandlerService, provide: ErrorMessageHandlerService },
                { useClass: MockMessageService, provide: MessageService },
                { useClass: MockFileUploadService, provide: FileUploadService },
                { useClass: MockEuDocumentsHttpService, provide: EuDocumentsHttpService },
                { useClass: MockUserService, provide: UserService },
                { useClass: MockFeaturesHttpService, provide: FeaturesHttpService },
                { useClass: MockUnderwritingDistributionService, provide: UnderwritingDistributionService }
            ],
            imports: [
                ReactiveFormsModule,
                ErrorModule
            ],
            declarations: [
                SendEmailModalComponent,
                MockMatProgressSpinnerComponent,
                MockAutocompleteMultiselectComponent,
                MockQuoteSelector,
                MockMessageComponent,
                MockInputFileComponent,
                MockMatIcon,
                MockMatFormField,
                MockMatSpinnerComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(SendEmailModalComponent);
        component = fixture.componentInstance;

        component.quote = createQuote();
        component.emailType = EmailType.sendQuote;
        component.user = createContact();

    });

    let getQuoteEmailTemplateSpy: jasmine.Spy;
    let getPolicyEmailTemplateSpy: jasmine.Spy;
    let getEmailContactsSpy: jasmine.Spy;
    let sendEmailSpy: jasmine.Spy;
    let sendEuDocumentsSpy: jasmine.Spy;

    beforeEach(inject([EmailHttpService, QuoteEmailHttpService, PolicyEmailHttpService, EmailContactService, EuDocumentsHttpService],
        (emailHttpService: EmailHttpService,
            quoteEmailHttpService: QuoteEmailHttpService,
            policyEmailHttpService: PolicyEmailHttpService,
            emailContactService: EmailContactService,
            euDocumentsHttpService: EuDocumentsHttpService) => {
            getQuoteEmailTemplateSpy = spyOn(quoteEmailHttpService, "getEmailTemplateForQuote").and.returnValue(from([getTestQuoteEmailTemplate()]));
            getPolicyEmailTemplateSpy = spyOn(policyEmailHttpService, "getEmailTemplateForPolicy").and.returnValue(from([getTestPolicyEmailTemplate()]));
            getEmailContactsSpy = spyOn(emailContactService, "getEmailContacts").and.returnValue(from([[]]));
            sendEmailSpy = spyOn(emailHttpService, "sendEmail").and.returnValue(from([new MessageResult()]));
            sendEuDocumentsSpy = spyOn(euDocumentsHttpService, "sendEuDocuments").and.returnValue(from([new MessageResult()]));

            fixture.detectChanges();
        }));

    describe("ngOnInit", () => {
        it("should create the component", () => expect(component).toBeTruthy());

        it("should call getQuoteEmailTemplate", () => expect(getQuoteEmailTemplateSpy).toHaveBeenCalledTimes(1));

        it("should not call getPolicyEmailTemplate", () => expect(getPolicyEmailTemplateSpy).toHaveBeenCalledTimes(0));

        it("should call getEmailContacts", () => expect(getEmailContactsSpy).toHaveBeenCalled());
    });

    describe("mergefields", () => {
        it("should get commission and quote references mergefields", () => {
            const expectedMergeFields = {
                "Commission": createQuote().commissionInformation.actualGrossCommission.toFixed(2).toString() + "%",
                "QuoteReferences": createQuote().quoteReference.toString()
            } as { [key: string]: string }

            expect(component.form.controls.mergeFields.value).toEqual(expectedMergeFields);
        });
    });

    describe("send", () => {
        it("should call sendEmail for non EU quotes", () => {
            component.send();

            expect(sendEmailSpy).not.toHaveBeenCalled();
            expect(sendEuDocumentsSpy).not.toHaveBeenCalled();
        });

        it("should call sendEmail for non EU policy", () => {
            component.emailType = EmailType.sendPolicy;
            component.policyNumber = "TEST123456";

            component.send();

            expect(sendEmailSpy).not.toHaveBeenCalled();
            expect(sendEuDocumentsSpy).not.toHaveBeenCalled();
        });

        it("should call sendEuDocuments for EU quotes", () => {
            getQuoteEmailTemplateSpy.and.returnValue(from([getTestEuQuoteEmailTemplate()]));
            component.ngOnInit();
            fixture.detectChanges();

            component.send();

            expect(sendEuDocumentsSpy).toHaveBeenCalled();
            expect(sendEmailSpy).not.toHaveBeenCalled();
        });

        it("should call sendEuDocuments for EU policy", () => {
            getPolicyEmailTemplateSpy.and.returnValue(from([getTestEuPolicyEmailTemplate()]));
            component.emailType = EmailType.sendPolicy;
            component.ngOnInit();
            fixture.detectChanges();

            component.send();

            expect(sendEuDocumentsSpy).toHaveBeenCalled();
            expect(sendEmailSpy).not.toHaveBeenCalled();
        });

        it("should call handleError when sendEmail returns an error",
            inject([ErrorMessageHandlerService],
                (errorMessageHandlerService: ErrorMessageHandlerService) => {
                    sendEmailSpy.and.returnValue(new Observable(subscriber => subscriber.error({ message: "test" })));
                    const handleErrorSpy = spyOn(errorMessageHandlerService, "handleError");

                    component.send();

                    expect(handleErrorSpy).toHaveBeenCalled();
                }));
    });
});

function getTestQuoteEmailTemplate(): EmailTemplate {
    const template = new EmailTemplate();
    template.subject = "";
    template.plainTextTemplate = "";
    template.defaultAttachments = [];
    template.emailType = EmailType.sendQuote;
    return template;
}

function getTestPolicyEmailTemplate(): EmailTemplate {
    const template = new EmailTemplate();
    template.subject = "";
    template.plainTextTemplate = "";
    template.defaultAttachments = [];
    template.emailType = EmailType.sendPolicy;
    return template;
}

function getTestEuQuoteEmailTemplate(): EmailTemplate {
    const template = new EmailTemplate();
    template.subject = "";
    template.plainTextTemplate = "";
    template.defaultAttachments = [];
    template.emailType = EmailType.sendEuQuote;
    return template;
}

function getTestEuPolicyEmailTemplate(): EmailTemplate {
    const template = new EmailTemplate();
    template.subject = "";
    template.plainTextTemplate = "";
    template.defaultAttachments = [];
    template.emailType = EmailType.sendEuPolicy;
    return template;
}

function createQuote(): Quote {
    const quote = new Quote();
    quote.quoteReference = 123;
    const brokerContact = new BrokerContact();
    brokerContact.email = "test@broker.com";
    quote.brokerContact = brokerContact;
    const assignedContact = new CfcContact();
    assignedContact.email = "test@assigned.com";
    quote.assignedContact = assignedContact;
    const client = new Client();
    client.companyName = "Test Inc.";
    quote.client = client;
    const commissionInformation = new CommissionInformation();
    commissionInformation.actualGrossCommission = 22.5;
    quote.commissionInformation = commissionInformation;
    return quote;
}

function createContact(): CfcContact {
    const user = new CfcContact();
    user.email = "test@user.com";

    return user;
}

class MockMatDialogRef {
    public close(): void { }
}

class MockEmailHttpService {
    public getEmailTemplateForEnquiry = () => from([]);
    public sendEmail = () => from([]);
}

class MockQuoteEmailHttpService {
    public getEmailTemplateForQuote = () => from([]);
}

class MockPolicyEmailHttpService {
    public getEmailTemplateForPolicy = () => from([]);
}

class MockEmailContactService {
    public getEmailContacts = () => from([]);
}

class MockErrorMessageHandlerService {
    public handleError(): void { }
}

class MockMessageService {
    public clearMessage(): void { }
}

class MockFileUploadService {
    public readFile = () => from([]);
}

class MockEuDocumentsHttpService {
    public sendEuDocuments = () => from([]);
}

class MockUserService {
    public isFeatureAccessible = () => true;
}

class MockFeaturesHttpService {
    public isFeatureActive = (featureName :string) : Observable<FeatureAccess | any> => {
        const featureAccess = new FeatureAccess();
        featureAccess.featureName = featureName;
        featureAccess.hasAccess = true;
        return from([featureAccess]);
    };
}

class MockUnderwritingDistributionService {
    public sendUnderwritingDistributionEmail = () => true;
}

@Component({ selector: "mat-progress-spinner", template: "" })
class MockMatProgressSpinnerComponent {
}

@Component({ selector: "mat-spinner", template: "" })
class MockMatSpinnerComponent {
    @Input() public diameter: number;
}

@Component({ selector: "message", template: "" })
class MockMessageComponent { }

@Component({
    selector: "input-file",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockInputFileComponent),
            multi: true
        }
    ]
})

class MockInputFileComponent implements ControlValueAccessor {
    @Input() public formCtrl: FormControl;
    @Input() public fileTypes: string;
    @Input() public multiple: boolean;
    @Input() public defaultAttachments: ServerSideFileData[];

    public writeValue(): void { }
    public registerOnChange(): void { }
    public registerOnTouched(): void { }
}

@Component({
    selector: "autocomplete-multiselect",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockAutocompleteMultiselectComponent),
            multi: true
        }
    ]
})

class MockAutocompleteMultiselectComponent implements ControlValueAccessor {
    @Input() public formCtrl: FormControl;
    @Input() public options: any[];
    @Input() public displayName: () => string;
    @Input() public dropDownDisplay: () => string;
    @Input() public autoShowOnFocus: boolean;

    public writeValue(): void { }
    public registerOnChange(): void { }
    public registerOnTouched(): void { }
}

@Component({
    selector: "quote-selector",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockQuoteSelector),
            multi: true
        }
    ]
})
class MockQuoteSelector implements ControlValueAccessor {
    @Input() public quoteIds: number[];
    @Input() public primaryQuoteId: number;

    public writeValue(): void { }
    public registerOnChange(): void { }
    public registerOnTouched(): void { }
}

@Component({ selector: "mat-icon", template: "" })
class MockMatIcon { }

@Component({ selector: "mat-form-field", template: "" })
class MockMatFormField { }
