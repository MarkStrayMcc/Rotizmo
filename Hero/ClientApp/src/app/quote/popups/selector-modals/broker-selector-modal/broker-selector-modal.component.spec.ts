import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { MaterialModule } from "@app/material/material.module";
import { mockCfcContact } from '@app/mocks/cfc-contact.mock';
import { CfcContact } from "@app/models";
import { EnquirySearchResponse } from "@app/models/auto-generated/EnquirySearchResponse";
import { EnquirySearchResult } from "@app/models/auto-generated/EnquirySearchResult";
import { EnquiryHttpService } from "@app/services/enquiry-http-service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { of } from "rxjs";
import { BrokerSelectorModalComponent } from "./broker-selector-modal.component";

describe("BrokerSelectorModalComponent", () => {
    let component: BrokerSelectorModalComponent;
    let fixture: ComponentFixture<BrokerSelectorModalComponent>;

    class MockUserServiceTest {
        public getData() { return of(mockCfcContact); }
    };

    const mockEnquirySearchResult: EnquirySearchResult = {
        enquiryId: 12345,
        enquiryUid: '757D4160-2008-48B0-B9DD-3F418625AF61',
        enquiryReceivedDate: new Date("02/26/2021"),
        assignedUnderwriterInitials: "RDF",
        brokerContactId: 123,
        brokerContactName: "Fante",
        brokerTeamId: 123,
        brokerTeamName: "CFC",
        brokerCompanyId: 12,
        brokerCompanyName: "Broker Company Name"
    }

    const mockEnquirySearchResponse: EnquirySearchResponse = {
        results: [mockEnquirySearchResult]
    }

    const mockFormGroup = new FormGroup({
        broker: new FormControl(""),
    });

    const mockFormBuilder = jasmine.createSpyObj("mockFormBuilder", ["group"]);
    mockFormBuilder.group.and.returnValue(mockFormGroup);

    class MockEnquiryService {
        public enquiriesSearch() { return of(mockEnquirySearchResponse); }
    };

    class MockMatDialogRef<T> {
        public close(dialogResult?: any): void { return; }
    }

    class MockModalDialogService {
        public openDialog<T, TY>(obj) { return; }
    }

    const mockUserProfile: CfcContact = mockCfcContact;

    const testModuleConfiguration = {
        declarations: [
            BrokerSelectorModalComponent
        ],
        imports: [
            CommonModule,
            MaterialModule,
            FormsModule,
            ReactiveFormsModule
        ],
        providers: [
            { provide: FormBuilder, useValue: mockFormBuilder },
            { provide: MatDialogRef, useClass: MockMatDialogRef },
            { provide: UserService, useClass: MockUserServiceTest },
            { provide: ModalDialogService, useValue: MockModalDialogService },
            { provide: EnquiryHttpService, useClass: MockEnquiryService }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(BrokerSelectorModalComponent);
        component = fixture.componentInstance;

        component.ngOnInit();
    });

    it("should create Broker Selector component", () => {
        expect(component).toBeDefined();
    });

    it("Should set the user profile on init and create the brokerSelectionForm", () => {
        // Arrange
        // Act
        // Assert
        expect(component.userProfile).toBeDefined();
        expect(component.brokerSelectionForm).toBeDefined();
    });

    it("Should set the broker list", () => {
        // Arrange
        // Act
        // Assert
        expect(component.brokersList).toEqual([mockEnquirySearchResult]);
    });

    it("Should have a selected broker when closing the modal", () => {
        // Arrange
        component.brokerSelectionForm.get("broker").setValue(mockEnquirySearchResult);

        // Act
        component.onSaveBroker();

        // Assert
        expect(component.brokerSelectionForm.get("broker").value).toEqual(mockEnquirySearchResult);
    });
});
