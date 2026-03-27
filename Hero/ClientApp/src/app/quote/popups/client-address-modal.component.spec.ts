import { OverlayContainer } from "@angular/cdk/overlay";
import { APP_BASE_HREF } from "@angular/common";
import { Component, Directive, NgModule, ViewChild, ViewContainerRef } from "@angular/core";
import { async, ComponentFixture, inject, TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";
import { DBOperation } from "../../enums/DBOperations";
import { LocationHttpService } from "../../services/location-http.service";
import { ClientAddressModal } from "./client-address-modal.component";
import { AddressClientLocationModal } from "./client-address-modal.model";
import {QuoteModule} from "../quote.module";

/* tslint:disable:max-classes-per-file */
let clientAddressTest: ClientAddressModalTest;
let dialog: MatDialog;
let dialogRef: MatDialogRef<ClientAddressModal>;
let overlayContainerElement: HTMLElement;

let testViewContainerRef: ViewContainerRef;
let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

// TODO: Rewrite these unit tests with mocks and spies, performance was too bad post-Daixit
//describe("ClientAddressModal", () => {

//    beforeEach(async(() => {
//        TestBed.configureTestingModule({
//            providers: [
//                {
//                    provide: OverlayContainer, useFactory: () => {
//                        overlayContainerElement = document.createElement("div");
//                        return { getContainerElement: () => overlayContainerElement };
//                    }
//                },
//                { provide: APP_BASE_HREF, useValue: "/" },
//                LocationHttpService
//            ],
//            imports: [
//                DialogTestModule
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

//    it("We should have a primary location", () => {
//        expect(clientAddressTest.getLocations).toHaveBeenCalled();
//        expect(dialogRef.componentInstance.dialogModel.client.primaryLocation).toBeTruthy();
//    });

//});

function createComponent() {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;

    dialogRef = dialog.open(ClientAddressModal, {
        viewContainerRef: testViewContainerRef
    });

    clientAddressTest = new ClientAddressModalTest();

    viewContainerFixture.detectChanges();
    viewContainerFixture.whenStable().then(() => {
        clientAddressTest.addPageElements();
    });

}

class ClientAddressModalTest {

    public getLocations: jasmine.Spy;

    public locationHttpService: LocationHttpService;
    constructor() {

        dialogRef.componentInstance.dialogModel = {
            client: {
                id: 62854,
                companyName: "LG Squared Inc",
                headquartersCountry:
                {
                    countryId: 1,
                    name: "UK",
                    isoCode: "GB",
                    currency: {
                        id: 3,
                        name: "United Kingdom Pounds",
                        isoCode: "GBP",
                        symbol: "£"
                    }
                },
                primaryLocation: {
                    clientLocationId: 308697,
                    clientId: 62854,
                    address1: "7 ashfield grove",
                    address2: "",
                    address3: "",
                    city: "bradford",
                    countryId: 1,
                    postcode: "bd9998toio",
                    isPrimaryLocation: true,
                    stateProvinceCode: "",
                    county: "west yorkshire",
                    disabledOn: null,
                    country: {
                        countryId: 1,
                        name: "UK",
                        isoCode: "GB",
                        currency: {
                            id: 3,
                            name: "United Kingdom Pounds",
                            isoCode: "GBP",
                            symbol: "£"
                        }
                    }

                }
            },
            dbOperation: DBOperation.create,
            editLocation: null,
            modalTitle: "Add Address",
            modalBtnTitle: "Save",
            defaultLocation: {
                    countryId: 1,
                    name: "UK",
                    isoCode: "GB",
                    currency: {
                        id: 3,
                        name: "United Kingdom Pounds",
                        isoCode: "GBP",
                        symbol: "£"
                }
            }
        } as AddressClientLocationModal;

        this.getLocations = spyOn(dialogRef.componentInstance.locationHttpService, "getMainData")
            .and.returnValue(of(
                [{ clientLocationId: 308725, clientId: 62854, address1: "sds", City: "Marananga", State_Province_Code: "SA", County: "Light Regional Council", isPrimaryLocation: false },
                { clientLocationId: 308735, clientId: 62854, address1: "Manaton Close", City: "London", State_Province_Code: null, County: "Greater London", isPrimaryLocation: false },
                { clientLocationId: 308697, clientId: 62854, address1: "7 ashfield grove", City: "bradford", State_Province_Code: "", County: "west yorkshire", isPrimaryLocation: true }
                ]
            ));
    }

    public addPageElements() {

        dialogRef.componentInstance.setPrimaryLocation();
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

const testDirectives = [
    ComponentWithChildViewContainer,
    DirectiveWithViewContainer
];

@NgModule({
    imports: [
        NoopAnimationsModule,
        QuoteModule
    ],
    exports: testDirectives,
    declarations: [
        testDirectives
    ]
})
class DialogTestModule { }
