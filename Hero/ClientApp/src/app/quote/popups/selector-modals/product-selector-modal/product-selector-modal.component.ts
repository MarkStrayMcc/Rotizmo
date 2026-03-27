import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Observable } from "rxjs";
import { DropDownItem, Product } from "@app/models";
import { ConfigService } from "@app/services/config.service";
import { DropdownService } from "@app/services/dropdown.service";
import { ProductHttpService } from "@app/services/product-http.service";

@Component({
    selector: "product-selector-modal",
    templateUrl: "product-selector-modal.component.html"
})
export class ProductSelectorModal implements OnInit {
    public productForm: FormGroup;
    public products: Observable<DropDownItem[]>;
    public isProductSelected: boolean = false;
    public isOutsideProductSelected: boolean = false;

    public selectedProduct: Product;

    constructor(
        public dialogRef: MatDialogRef<ProductSelectorModal>,
        public dropdownService: DropdownService,
        public productService: ProductHttpService,
        private configService: ConfigService,
        private formBuilder: FormBuilder) {
    }

    public ngOnInit() {
        this.products = this.dropdownService.getProducts();
        this.productForm = this.formBuilder.group({
            product: [""],
        });
        this.dialogRef.disableClose = !this.isOutsideProductSelected;
    }

    public confirmProduct(formData: any) {
        const product = this.getSelectedProduct();
        this.dialogRef.close(product);
    }

    public onProductChange(change: any) {

        const element = this.productForm.get("product");

        if (element.value && element.value.value > 0) {
            this.productService.getById(element.value.value).subscribe(product => {
                this.selectedProduct = product;
                this.selectedProduct.enabledOnNewQuotePage = coerceBooleanProperty(element.value.hidden);
                this.isProductSelected = true;
            });
        } else {
            this.selectedProduct = undefined;
            this.isProductSelected = false;
        }
    }

    private getSelectedProduct(): Product {
        if (this.selectedProduct && !this.selectedProduct.enabledOnNewQuotePage) {
            this.goToNerdQuotePage();
        }
        return this.selectedProduct;
    }

    public goToNerdQuotePage() {
        window.location.href = this.configService.nerdUrl + "/quote.aspx";
    }

}
