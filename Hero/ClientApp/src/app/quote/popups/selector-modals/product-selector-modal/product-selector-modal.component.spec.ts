import { Component, DebugElement, Directive, NgModule, ViewChild, ViewContainerRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AbstractControl } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { BrowserModule, By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { Product } from "@app/models";
import { ProductSelectorModal } from "@app/quote/popups/selector-modals/product-selector-modal/product-selector-modal.component";
import { QuoteModule } from "@app/quote/quote.module";
import { DropdownService } from "@app/services/dropdown.service";
import { ProductHttpService } from "@app/services/product-http.service";
import { SharedModule } from "@app/shared/shared.module";
import { of } from "rxjs";

/* tslint:disable:max-classes-per-file */
let testViewContainerRef: ViewContainerRef;
let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;
let dialog: MatDialog;
let dialogRef: MatDialogRef<ProductSelectorModal>;
let productSelector: ProductSelector;

// TODO: Rewrite these unit tests with mocks and spies, performance was too bad post-Daixit
//describe("As an underwriter, I want to select the product when a new quote is created", () => {

//    beforeEach(async(() => {
//        TestBed.configureTestingModule({
//            imports: [
//                ProductSelectorTestModule
//            ],
//            providers: [
//                { provide: APP_BASE_HREF, useValue: "/" },
//                { provide: DropdownService, useClass: DropdownService },
//                { provide: ConfigService, useClass: ConfigService },
//                ProductSelectorModal
//            ]
//        }).compileComponents();

//    }));

//    beforeEach(async(inject([MatDialog], (d: MatDialog) => {
//        dialog = d;
//        createComponent();
//    })));

//    it("A searchable dropdown list is populated with the currently available products", () => {
//        let productsDdi: DropDownItem[];

//        dialogRef.componentInstance.products.subscribe((products) => productsDdi = products);

//        expect(productSelector.getProducts).toHaveBeenCalled();
//        expect(productsDdi.length).toBeGreaterThan(0);
//    });

//    it("If the product selected is not available on QQTv2 the user is redirected to the old QQT", () => {

//        const selectedDropdownItem: DropDownItem = {
//            value: "1",
//            text: "Architects & Engineers",
//            img: "",
//            hidden: "false"
//        };

//        productSelector.productControl.setValue(selectedDropdownItem);

//        expect(productSelector.getProductById).toHaveBeenCalled();

//        expect(dialogRef.componentInstance.selectedProduct).toEqual(productSelector.productNotQQtv2);

//        dialogRef.componentInstance.confirmProduct(null);

//        expect(productSelector.hrefChanged).toHaveBeenCalled();
//    });

//    it("If the product is available, it's populated on the basic tab", () => {

//        const selectedDropdownItem: DropDownItem = {
//            value: "2",
//            text: "Miscellaneous Professions",
//            img: "",
//            hidden: "true"
//        };

//        productSelector.productControl.setValue(selectedDropdownItem);

//        expect(productSelector.getProductById).toHaveBeenCalled();

//        expect(dialogRef.componentInstance.selectedProduct).toEqual(productSelector.productIsQQtv2);

//        dialogRef.componentInstance.confirmProduct(null);

//        expect(productSelector.hrefChanged).not.toHaveBeenCalled();
//        expect(productSelector.dialogClose).toHaveBeenCalledWith(productSelector.productIsQQtv2);
//    });
//});

function createComponent() {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;

    dialogRef = dialog.open(ProductSelectorModal, {
        viewContainerRef: testViewContainerRef
    });

    productSelector = new ProductSelector();

    viewContainerFixture.detectChanges();
    viewContainerFixture.whenStable().then(() => {
        productSelector.addPageElements();
    });
}

class ProductSelector {

    public getProducts: jasmine.Spy;
    public getProductById: jasmine.Spy;
    public hrefChanged: jasmine.Spy;
    public dialogClose: jasmine.Spy;

    public productNotQQtv2: Product;
    public productIsQQtv2: Product;

    public dropdownService: DropdownService;
    public productService: ProductHttpService;

    public productAutocomplete: DebugElement;

    public productControl: AbstractControl;

    constructor() {

        this.productNotQQtv2 = {
            productId: 1,
            productName: "A&E",
            productDisplay: "Architects & Engineers",
            enabledOnNewQuotePage: false
        } as Product;

        this.productIsQQtv2 = {
            productId: 2,
            productName: "PRO",
            productDisplay: "Miscellaneous Professions",
            enabledOnNewQuotePage: true
        } as Product;

        this.getProducts = spyOn(dialogRef.componentInstance.dropdownService, "getProducts")
            .and.returnValue(of(
                [
                    { value: "1", text: "Architects & Engineers", img: "", hidden: "false" },
                    { value: "2", text: "Miscellaneous Professions", img: "", hidden: "true" }
                ]
            ));

        this.getProductById = spyOn(dialogRef.componentInstance.productService, "getById")
            .and.callFake(function (id) {
                if (id === "1") {
                    return of({
                        productId: 1,
                        productName: "A&E",
                        productDisplay: "Architects & Engineers",
                        enabledOnNewQuotePage: false
                    });
                } else {
                    return of({
                        productId: 2,
                        productName: "PRO",
                        productDisplay: "Miscellaneous Professions",
                        enabledOnNewQuotePage: true
                    });
                }
            });

        this.hrefChanged = spyOn(dialogRef.componentInstance, "goToNerdQuotePage")
            .and.returnValue({});

        this.dialogClose = spyOn(dialogRef, "close");
    }

    public addPageElements() {

        this.productAutocomplete = viewContainerFixture.debugElement.query(By.css("#productAutocomplete"));

        this.productControl = dialogRef.componentInstance.productForm.get("product");
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
        BrowserModule,
        BrowserAnimationsModule,
        SharedModule,
        QuoteModule
    ],
    exports: [
        testDirectives,
        ProductSelectorModal,
        AutocompleteDropdown
    ],
    declarations: [
        testDirectives
    ]
})
class ProductSelectorTestModule { }
