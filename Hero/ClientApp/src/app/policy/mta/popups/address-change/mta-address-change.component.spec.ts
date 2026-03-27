import { Component, Directive, NgModule, ViewChild, ViewContainerRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { DBOperation } from "@app/enums/DBOperations";
import { Policy } from "@app/models";
import { ClientManageAddressModal } from "@app/quote/popups/client-manageaddress-modal.component";
import { QuoteModule } from "@app/quote/quote.module";
import { DropdownService } from "@app/services/dropdown.service";
import { MtaAddressChangeComponent } from "./mta-address-change.component";

/* tslint:disable:max-classes-per-file */
let clientManageAddressTest: ClientManageAddressModalTest;
let dialog: MatDialog;
let dialogRef: MatDialogRef<MtaAddressChangeComponent>;

let testViewContainerRef: ViewContainerRef;
let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

function createComponent() {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;

    dialogRef = dialog.open(MtaAddressChangeComponent, {
        viewContainerRef: testViewContainerRef
    });

    clientManageAddressTest = new ClientManageAddressModalTest();

    viewContainerFixture.detectChanges();
    viewContainerFixture.whenStable().then(() => {});

}

class ClientManageAddressModalTest {
    public dropdownService: DropdownService;
    constructor() {

        dialogRef.componentInstance.dialogModel = {
            client: clientMock,
            dbOperation: DBOperation.create,
            defaultLocation: defaultLocationMock,
            editLocation: null,
            locationId: 0,
            policy: policyMock,
            modalBtnTitle: "Save",
            modalTitle: "Address Change MTA"
        };
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

const policyMock: Policy = {
    reference: "string",
    companyGuid: "4e73f08g-6466-4699-826c-e0ad71196d4a",
    companyName: "string",
    brokerName: "string",
    productName: "string",
    inceptionDate: "string",
    expirationDate: "string",
    policyType: "string",
    policyUid: "string",
    nerdVersion: 3
}

const defaultLocationMock = {
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
}

const clientMock = {
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
}

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
