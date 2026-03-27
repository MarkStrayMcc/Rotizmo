import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { EuDocumentsHttpService } from "@app/compliance/services/eu-documents-http.service";
import * as mocks from "@app/policy/mocks/mta.mocks";
import { EmailContactService } from "@app/services/email-contact.service";
import { EmailHttpService } from "@app/services/email-http.service";
import { FileUploadService } from "@app/services/file-upload-service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { MtaSendEmailComponent } from "./mta-send-email.component";
import { mockEmailHttpService, mockEuDocumentsHttpService, mockFileUploadService } from "./mta-send-email.component.mock";

describe("MtaSendEmailComponent", () => {
    let component: MtaSendEmailComponent;
    let fixture: ComponentFixture<MtaSendEmailComponent>;

    const testModuleConfiguration = {
        declarations: [
            MtaSendEmailComponent,
            mocks.MockSharedFormCreatorComponent
        ],
        imports: [
            HttpClientModule,
            CommonModule,
            ReactiveFormsModule
        ],
        providers: [
            { provide: MessageService, useValue: mocks.mockMessageService },
            { provide: MatDialogRef, useClass: mocks.MockMatDialogRef },
            { provide: EmailHttpService, useValue: mockEmailHttpService },
            { provide: EuDocumentsHttpService, useValue: mockEuDocumentsHttpService },
            { provide: EmailContactService, userClass: mocks.MockEmailContactService },
            { provide: FileUploadService, useValue: mockFileUploadService },
            { provide: FormCreatorService, useValue: mocks.mockFormCreatorService },
            { provide: UserService, useValue: mocks.mockUserServiceTest }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(MtaSendEmailComponent);
        component = fixture.componentInstance;

        mockEmailHttpService.getEmailTemplateForMta.and.returnValue(mocks.mockMtaEmailTemplate);
    });

    it("should create Send Email component", () => {
        expect(component).toBeDefined();
    });
});
