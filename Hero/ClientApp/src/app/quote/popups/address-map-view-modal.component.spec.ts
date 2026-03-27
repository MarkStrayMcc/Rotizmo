//import { Directive, Component, ViewChild, ViewContainerRef, LOCALE_ID } from "@angular/core";
//import { DebugElement, NgModule } from '@angular/core';
//import { By } from '@angular/platform-browser';
//import { AbstractControl, FormBuilder } from "@angular/forms";
//import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
//import { MdDialog, MdDialogRef, MD_DATE_FORMATS, DateAdapter } from '@angular/material'
//import { MomentDateAdapter, MOMENT_DATE_FORMATS } from '../../../providers/momentDateAdapter'
//import { BrowserModule } from '@angular/platform-browser';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { HttpModule } from '@angular/http';
//import { Observable } from "rxjs";
//import { appSharedConfig } from '../../../quote/app.module.shared';
//import { AddressMapViewModal } from "./address-map-view-modal.component";
//import { Product } from "../quote.model";
//import { DropdownService } from "../../../services/dropdown.service";
//import { OverlayContainer } from '@angular/cdk/overlay';
//import * as moment from 'moment';
//import 'rxjs/add/observable/of';
//import { AddressClientLocationModal } from "./client-address-modal.model";

//let testViewContainerRef: ViewContainerRef;
//let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;
//let dialog: MdDialog;
//let dialogRef: MdDialogRef<AddressMapViewModal>;
//let overlayContainerElement: HTMLElement;
//let productSelector: ProductSelector;

//describe("As an underwriter, I can view an address on Google Maps", () => {

//    beforeEach(async(() => {
//        TestBed.configureTestingModule({
//            providers: [
//                { provide: "ORIGIN_URL", useValue: location.origin },
//                { provide: LOCALE_ID, useValue: 'en-GB' },
//                { provide: DateAdapter, useClass: MomentDateAdapter },
//                { provide: MD_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS },
//                {
//                    provide: OverlayContainer, useFactory: () => {
//                        overlayContainerElement = document.createElement('div');
//                        return { getContainerElement: () => overlayContainerElement };
//                    }
//                },
//                { provide: 'window', useValue: window.location },
//                FormBuilder,
//                appSharedConfig.providers
//            ],
//            imports: [
//                appSharedConfig.imports,
//                ProductSelectorTestModule
//            ]
//        }).compileComponents();

//    }));

//    beforeEach(inject([MdDialog], (d: MdDialog) => {
//        dialog = d;
//    }));

//    beforeEach(async(() => {
//        createComponent();
//    }));

//    it("A link on the address list is displayed for each address", () => {
//        //TODO
//    });

//    it("A new modal opens with Google Maps and a pin on the selected address is displayed", () => {
//        //TODO
//    });
//});

//function createComponent() {
//    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);
//    viewContainerFixture.detectChanges();
//    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;

//    dialogRef = dialog.open(AddressMapViewModal, {
//        viewContainerRef: testViewContainerRef
//    });

//    productSelector = new ProductSelector();

//    viewContainerFixture.detectChanges();
//    viewContainerFixture.whenStable().then(() => {
//        productSelector.addPageElements();
//    });
//}

//class ProductSelector {

//    getProducts: jasmine.Spy;
//    hrefChanged: jasmine.Spy;
//    dialogClose: jasmine.Spy;

//    productNotQQtv2: Product;
//    productIsQQtv2: Product;

//    dropdownService: DropdownService;

//    productAutocomplete: DebugElement;

//    productControl: AbstractControl;

//    constructor() {
//        dialogRef.componentInstance.dialogModel = new AddressClientLocationModal();
//        dialogRef.componentInstance.dialogModel.client = {
//            "id": 62854,
//            "companyName": "LG Squared Inc",
//            "headquartersCountry":
//            {
//                "countryId": 1,
//                "name": "UK",
//                "isoCode": "GB",
//                "currency": {
//                    "id": 3,
//                    "name": "United Kingdom Pounds",
//                    "isoCode": "GBP",
//                    "symbol": "£"
//                }
//            },
//            "primaryLocation": {
//                "clientLocationId": 308697,
//                "clientId": 62854,
//                "address1": "7 ashfield grove",
//                "address2": "",
//                "address3": "",
//                "city": "bradford",
//                "countryId": 1,
//                "postcode": "bd9998toio",
//                "isPrimaryLocation": true,
//                "stateProvinceCode": "",
//                "county": "west yorkshire",
//                "country": {
//                    "countryId": 1,
//                    "name": "UK",
//                    "isoCode": "GB",
//                    "currency": {
//                        "id": 3,
//                        "name": "United Kingdom Pounds",
//                        "isoCode": "GBP",
//                        "symbol": "£"
//                    }
//                }
//            }
//        };
//    }

//    addPageElements() {
//        this.productAutocomplete = viewContainerFixture.debugElement.query(By.css("#productAutocomplete"));
//    }
//}

//@Directive({ selector: 'dir-with-view-container' })
//class DirectiveWithViewContainer {
//    constructor(public viewContainerRef: ViewContainerRef) { }
//}

//@Component({
//    selector: 'arbitrary-component',
//    template: `<dir-with-view-container></dir-with-view-container>`,
//})
//class ComponentWithChildViewContainer {
//    @ViewChild(DirectiveWithViewContainer) childWithViewContainer: DirectiveWithViewContainer;

//    get childViewContainer() {
//        return this.childWithViewContainer.viewContainerRef;
//    }
//}

//const TEST_DIRECTIVES = [
//    ComponentWithChildViewContainer,
//    DirectiveWithViewContainer,
//    AddressMapViewModal
//];

//@NgModule({
//    imports: [
//        BrowserModule,
//        BrowserAnimationsModule,
//        HttpModule,
//        appSharedConfig.imports],
//    exports: TEST_DIRECTIVES,
//    declarations: TEST_DIRECTIVES,
//    entryComponents: [
//        ComponentWithChildViewContainer,
//        AddressMapViewModal
//    ]
//})
//class ProductSelectorTestModule { }
