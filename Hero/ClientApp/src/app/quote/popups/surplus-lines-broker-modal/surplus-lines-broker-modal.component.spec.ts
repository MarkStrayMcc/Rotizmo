import { ComponentFixture } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material";
import { SurplusLine } from "@app/models";
import { QuoteModule } from "@app/quote/quote.module";
import { QuoteService } from "@app/quote/services/quote.service";
import { SurplusLinesLicenseService } from "@app/quote/services/surplus-lines-license.service";
import { DropdownService } from "@app/services/dropdown.service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { from, Observable, of } from "rxjs";
import { Shallow } from "shallow-render";
import { getTestQuote } from "test-helpers";
import { SurplusLinesBrokerModalHandler } from "./surplus-lines-broker-modal-handler.service";
import { SurplusLinesBrokerModal } from "./surplus-lines-broker-modal.component";

describe("SurplusLinesBrokerModal Component", () => {
    let shallow: Shallow<SurplusLinesBrokerModal>;
    let injector: any;
    let component: SurplusLinesBrokerModal;
    let componentFixture: ComponentFixture<SurplusLinesBrokerModal>;

    beforeEach(async () => {
        shallow = new Shallow(SurplusLinesBrokerModal, QuoteModule)
            .mock(DropdownService, { getCountryStates: () => from([]) })
            .mock(SurplusLinesBrokerModalHandler, { save: mockSurplusLine })
            .mock(MatDialogRef, { close(): void { } })
            .mock(MessageService, { clearMessage: void {}, sendMessage: void {} })
            .mock(QuoteService, { getQuoteReference: () => getTestQuote() })
            .mock(UserService, { isFeatureAccessible: () => true });

        const { instance, fixture, inject } = await shallow.render({ detectChanges: false });

        component = instance;
        componentFixture = fixture;
        injector = inject;
    });

    describe("constructor", () => {
        it("should create component", () => {
            expect(component).toBeDefined();
        });
    });

    describe("ngOnInit", () => {
        let dropdownService: DropdownService;

        beforeEach(() => {
            dropdownService = injector(DropdownService);
            dropdownService.getCountryStates = jasmine.createSpy("getCountryStates");

            componentFixture.detectChanges();
        });

        it("should set broker contact email when heroSurplusLinesLicense is enabled", () => {
            expect(component["brokerContactEmail"]).toBe("Albert_Geraci@rpsins.com");
        });

        it("should create the form", () => {
            expect(component.form).toBeDefined();
        });

        it("should call getCountryStates", () => {
            expect(dropdownService.getCountryStates).toHaveBeenCalledWith("US");
        });
    });

    describe("save", () => {
        let surplusLinesLicenseService: SurplusLinesLicenseService;

        beforeEach(() => {
            surplusLinesLicenseService = injector(SurplusLinesLicenseService);
            componentFixture.detectChanges();
        });

        it("should not call to save surplus line if form is invalid", () => {
            // Arrange
            surplusLinesLicenseService.saveSurplusLinesLicense = jasmine.createSpy("save").and.returnValue(of(null));

            // Act
            component.save();

            // Assert
            expect(surplusLinesLicenseService.saveSurplusLinesLicense).toHaveBeenCalledTimes(0);
        });

        it("should call to save surplus line if form is valid", () => {
            // Arrange
            setFormValues(component.form);
            surplusLinesLicenseService.saveSurplusLinesLicense = jasmine.createSpy("save").and.returnValue(of(null));

            // Act
            component.save();

            // Assert
            expect(surplusLinesLicenseService.saveSurplusLinesLicense).toHaveBeenCalledTimes(1);
            expect(surplusLinesLicenseService.saveSurplusLinesLicense).toHaveBeenCalledWith(component.form);
        });

    });

    describe("form validation", () => {
        beforeEach(() => {
            componentFixture.detectChanges();
        });

        it("should be valid if name is shorter than 150 characters", () => {
            component.form.controls.name.setValue("Test Broker");
            expect(component.form.controls.name.valid).toBe(true);
        });

        it("should error if name is longer than 150 characters", () => {
            component.form.controls.name.setValue("this is a value that will allow me to test the name field validation, as it shouldn't allow values longer than 150 characters, but this one has 158 characters")
            expect(component.form.controls.name.valid).toBe(false);
            expect(component.form.controls.name.errors.maxlength).toBeTruthy();
        });

        it("should be valid if company is shorter than 150 characters", () => {
            component.form.controls.company.setValue("Test Company");
            expect(component.form.controls.company.valid).toBe(true);
        });

        it("should error if company is longer than 150 characters", () => {
            component.form.controls.company.setValue("this is a value that will allow me to test the name field validation, as it shouldn't allow values longer than 150 characters, but this one has 158 characters")
            expect(component.form.controls.company.valid).toBe(false);
            expect(component.form.controls.company.errors.maxlength).toBeTruthy();
        });

        it("should not be valid if company is empty", () => {
            component.form.controls.company.setValue(null);
            expect(component.form.controls.company.valid).toBe(false);
            expect(component.form.controls.company.errors.required).toBeTruthy();
        });

        it("should not be valid if licenceState is empty", () => {
            component.form.controls.licenceState.setValue(null);
            expect(component.form.controls.licenceState.valid).toBe(false);
            expect(component.form.controls.licenceState.errors.required).toBeTruthy();
        });

        it("should not be valid if licence is empty", () => {
            component.form.controls.licence.setValue(null);
            expect(component.form.controls.licence.valid).toBe(false);
            expect(component.form.controls.licence.errors.required).toBeTruthy();
        });

        it("should not be valid if expiry is empty", () => {
            component.form.controls.expiry.setValue(null);
            expect(component.form.controls.expiry.valid).toBe(false);
            expect(component.form.controls.expiry.errors.required).toBeTruthy();
        });

        it("should not be valid if address1 is empty", () => {
            component.form.controls.address1.setValue(null);
            expect(component.form.controls.address1.valid).toBe(false);
            expect(component.form.controls.address1.errors.required).toBeTruthy();
        });

        it("should not be valid if state is empty", () => {
            component.form.controls.state.setValue(null);
            expect(component.form.controls.state.valid).toBe(false);
            expect(component.form.controls.state.errors.required).toBeTruthy();
        });

        it("should not be valid if zip is empty", () => {
            component.form.controls.zip.setValue(null);
            expect(component.form.controls.zip.valid).toBe(false);
            expect(component.form.controls.zip.errors.required).toBeTruthy();
        });
    });
});

function mockSurplusLine(): Observable<SurplusLine> {
    let stubSurplusLine = new SurplusLine();
    stubSurplusLine.id = 17;
    stubSurplusLine.stateProvinceCode = "CA";
    stubSurplusLine.address1 = "Test Street";
    stubSurplusLine.brokerName = "Test Broker";
    stubSurplusLine.contactName = "Test Contact";
    stubSurplusLine.expiryDate = new Date();
    stubSurplusLine.licenseNumber = "12";
    stubSurplusLine.zip = "T0M 4T0";
    stubSurplusLine.expiryDate = new Date();
    stubSurplusLine.surplusLineBrokerUid = "guid:guid";
    return of(stubSurplusLine);
}

function setFormValues(form): void {
    form.controls.company.setValue("test inc.");
    form.controls.licence.setValue("test123");
    form.controls.licenceState.setValue({
        "value": "CA",
        "text": "California",
        "img": "",
        "hidden": "4"
    });
    form.controls.expiry.setValue(new Date());
    form.controls.address1.setValue("test street");
    form.controls.state.setValue({
        "value": "CA",
        "text": "California",
        "img": "",
        "hidden": "4"
    });
    form.controls.zip.setValue("1234");
}
