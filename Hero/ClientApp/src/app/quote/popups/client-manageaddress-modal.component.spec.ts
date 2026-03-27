import { OverlayContainer } from "@angular/cdk/overlay";
import { APP_BASE_HREF } from "@angular/common";
import { Component, Directive, NgModule, ViewChild, ViewContainerRef } from "@angular/core";
import { async, ComponentFixture, inject, TestBed } from "@angular/core/testing";
import { AbstractControl, FormBuilder } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";
import { DBOperation } from "@app/enums/DBOperations";
import { DropDownItem } from "@app/models";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { LocationHttpService } from "@app/services/location-http.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { QuoteModule } from "@app/quote/quote.module";
import { ClientManageAddressModal } from "@app/quote/popups/client-manageaddress-modal.component";

/* tslint:disable:max-classes-per-file */
let clientManageAddressTest: ClientManageAddressModalTest;
let dialog: MatDialog;
let dialogRef: MatDialogRef<ClientManageAddressModal>;
let overlayContainerElement: HTMLElement;

let testViewContainerRef: ViewContainerRef;
let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

// TODO: Rewrite these unit tests with mocks and spies, performance was too bad post-Daixit
//describe("ClientManageAddressModal", () => {

//    beforeEach(async(() => {
//        TestBed.configureTestingModule({
//            imports: [
//                DialogTestModule
//            ],
//            providers: [
//                {
//                    provide: OverlayContainer, useFactory: () => {
//                        overlayContainerElement = document.createElement("div");
//                        return { getContainerElement: () => overlayContainerElement };
//                    }
//                },
//                { provide: APP_BASE_HREF, useValue: "/" },
//                { provide: LocationHttpService, useClass: LocationHttpService },
//                { provide: DropdownService, useClass: DropdownService },
//                { provide: DropDownManagerService, useClass: DropDownManagerService},
//                FormBuilder,
//                MessageService,
//                ErrorMessageHandlerService,
//                ModalDialogService
//            ]
//        }).compileComponents();
//    }));

//    beforeEach(inject([MatDialog],
//        (d: MatDialog) => {
//            dialog = d;
//        }));

//    beforeEach(async(() => {
//        createComponent();
//    }));

//    it("A searchable dropdown list is populated with the currently available countries", () => {
//        let countriesDropDown: DropDownItem[];

//        dialogRef.componentInstance.countries.subscribe((countries) => countriesDropDown = countries);

//        expect(clientManageAddressTest.getAutocompleteAddresses).toHaveBeenCalled();
//        expect(clientManageAddressTest.getCountries).toHaveBeenCalled();
//        expect(countriesDropDown.length).toBeGreaterThan(0);
//    });

//    it("The country dropdown should have a default value", () => {
//        let countriesDropDown: DropDownItem[];

//        expect(clientManageAddressTest.countryControl.value.text).toBe("UK", "Country is UK");
//        dialogRef.componentInstance.countries.subscribe((countries) => countriesDropDown = countries);

//        expect(countriesDropDown.length).toBeGreaterThan(0);

//    });

//    it("If the country is AU then stateCountry should have a value",
//        () => {
//            const selectedCountry = { value: 3, text: "Australia", img: "", hidden: "AU" };

//            clientManageAddressTest.countryControl.setValue(selectedCountry);
//            dialogRef.componentInstance.addressForm.get("city").setValue("Test City");
//            dialogRef.componentInstance.addressForm.get("address1").setValue("Test Address");

//            expect(dialogRef.componentInstance.addressForm.valid).toBeFalsy();

//        });

//});

function createComponent() {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;

    dialogRef = dialog.open(ClientManageAddressModal, {
        viewContainerRef: testViewContainerRef
    });

    clientManageAddressTest = new ClientManageAddressModalTest();

    viewContainerFixture.detectChanges();
    viewContainerFixture.whenStable().then(() => {
        clientManageAddressTest.addPageElements();
    });

}

class ClientManageAddressModalTest {

    public country: AbstractControl;
    public getCountries: jasmine.Spy;
    public getCountryStates: jasmine.Spy;
    public getAutocompleteAddresses: jasmine.Spy;

    public countryControl: AbstractControl;

    public dropdownService: DropdownService;
    constructor() {

        dialogRef.componentInstance.dialogModel = {
           client: {
                uid: "4e73f08g-6466-4699-826c-e0ad71196d4a",
                companyName: "LG Squared Inc",
                headquartersCountry:
                {
                    countryId: 1,
                    currency: {
                        id: 3,
                        isoCode: "GBP",
                        name: "United Kingdom Pounds",
                        symbol: "£",
                        rate: 1.0
                    },
                    isoCode: "GB",
                    name: "UK"
                },
                id: 62854,
                primaryLocation: {
                    address1: "7 ashfield grove",
                    address2: "",
                    address3: "",
                    city: "bradford",
                    clientId: 62854,
                    clientLocationId: 308697,
                    country: {
                        countryId: 1,
                        currency: {
                            id: 3,
                            isoCode: "GBP",
                            name: "United Kingdom Pounds",
                            symbol: "£",
                            rate: 1.0
                        },
                        isoCode: "GB",
                        name: "UK"
                    },
                    countryId: 1,
                    county: "west yorkshire",
                    disabledOn: null,
                    isPrimaryLocation: true,
                    postcode: "bd9998toio",
                    stateProvinceCode: ""
                },
                hasEuSubsidiaries: false
            },
            dbOperation: DBOperation.create,
            defaultLocation: {
                countryId: 1,
                currency: {
                    id: 3,
                    isoCode: "GBP",
                    name: "United Kingdom Pounds",
                    symbol: "£",
                    rate: 1.0
                },
                isoCode: "GB",
                name: "UK"
            },
            editLocation: null,
            locationId: 0,
            modalBtnTitle: "Save",
            modalTitle: "Add Address"
        };

        this.getAutocompleteAddresses = spyOn(dialogRef.componentInstance.dropdownService, "getAutocompleteAddresses")
            .and.returnValue(of(
                [
                    { value: 1, text: "UK", img: "", hidden: "GB" },
                    { value: 2, text: "Canda", img: "", hidden: "CA" }
                ]
            ));

        this.getCountries = spyOn(dialogRef.componentInstance.dropdownService, "getCountries")
            .and.returnValue(of(
                [
                    { value: 1, text: "UK", img: "", hidden: "GB" },
                    { value: 2, text: "Canda", img: "", hidden: "CA" }
                ]
            ));

        this.getCountryStates = spyOn(dialogRef.componentInstance.dropdownService, "getCountryStates")
            .and.returnValue(of(
                [
                    { value: "ACT", text: "Australian Capital Territory", img: "", hidden: "" },
                    { value: "NoT", text: "Northern Territory", img: "", hidden: "" }
                ]
            ));
    }

    public addPageElements() {

        dialogRef.componentInstance.initialiseData();

        dialogRef.componentInstance.addressForm.patchValue(
            {
                clientId: dialogRef.componentInstance.dialogModel.client.id,
                clientLocationId: 0,
                country: dialogRef.componentInstance.defaultCountry,
                countryId: dialogRef.componentInstance.defaultCountry.value,
                isPrimaryLocation: false
            }
        );
        this.countryControl = dialogRef.componentInstance.addressForm.get("country");
    }
}

@Directive({ selector: "dir-with-view-container" })
class DirectiveWithViewContainer {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: "arbitrary-component",
    template: `<dir-with-view-container></dir-with-view-container>`
})
class ComponentWithChildViewContainer {
    @ViewChild(DirectiveWithViewContainer) public childWithViewContainer: DirectiveWithViewContainer;

    get childViewContainer() {
        return this.childWithViewContainer.viewContainerRef;
    }
}

const TEST_DIRECTIVES = [
    ComponentWithChildViewContainer,
    DirectiveWithViewContainer
];

@NgModule({
    declarations: [
        TEST_DIRECTIVES
    ],
    exports: [
        TEST_DIRECTIVES,
        ClientManageAddressModal
    ],
    imports: [
        NoopAnimationsModule,
        QuoteModule
    ]
})
class DialogTestModule { }
