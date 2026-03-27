import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { DBOperation } from "@app/enums/DBOperations";
import { DropDownTypes } from "@app/enums/DropDownTypes";
import { AutocompleteRequest, PlaceResult } from "@app/models/locationapis.model";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { LocationHttpService } from "@app/services/location-http.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { AddressClientLocationModal } from "@app/quote/popups/client-address-modal.model";
import { Client, ClientLocation, Country, DropDownItem } from "@app/models";
import { Subscription, Observable } from "rxjs";
import { first } from "rxjs/operators";

@Component({
    selector: "client-manageaddress-modal",
    templateUrl: "client-manageaddress-modal.component.html",
})
export class ClientManageAddressModal implements OnInit, OnDestroy {

    public client: Client;
    public location: ClientLocation;
    public dialogModel: AddressClientLocationModal;

    @ViewChild("ddlPostcode") public ddlPostcode: AutocompleteDropdown;
    @ViewChild("ddlCountries") public ddlCountry: AutocompleteDropdown;
    @ViewChild("ddlStateProvinceCode") public ddlStateProvinceCode: AutocompleteDropdown;

    public postcodeLookup: Observable<any>;
    public countries: Observable<any>;
    public countryStates: Observable<any>;

    public dbFilter: AutocompleteRequest;

    public msgError: string;
    public addressForm: FormGroup;
    public dbOperations: DBOperation;

    public modalTitle: string;
    public modalBtnTitle: string;

    public defaultCountry: DropDownItem;
    public showState: boolean;

    public countriesWithStates: string[];
    public serachResults: DropDownItem[];

    private formSubscription: Subscription;
    private postCodeSubscription: Subscription;
    private placeDetailsSubscription: Subscription;

    public formErrors = {
        address1: "",
        address2: "",
        address3: "",
        postcode: "",
        city: "",
        country: "",
        stateProvinceCode: "",
    };

    public validationMessages = {
        address1: {
            maxlength: "Cannot be more than 100 characters long",
            required: "Required",
        },
        address2: {
            maxlength: "Cannot be more than 100 characters long",
        },
        address3: {
            maxlength: "Cannot be more than 100 characters long",
        },
        city: {
            required: "Required",
        },
        postcode: {
            required: "Required",
        },
        country: {
            required: "Required",
            invalidOption: "Please enter a valid country",
        },
        stateProvinceCode: {
            required: "Required",
            invalidOption: "Please enter a valid state",
        },
    };

    constructor(private readonly dialogRef: MatDialogRef<ClientManageAddressModal>,
        public locationHttpService: LocationHttpService,
        public dropdownService: DropdownService,
        public dropDownManagerService: DropDownManagerService,
        private formBuilder: FormBuilder) {

    }

    public ngOnInit() {
        this.showState = false;
        this.countriesWithStates = ["CA", "AU", "US"];
        //declare the form
        this.addressForm = this.formBuilder.group({
            clientLocationId: [""],
            clientId: [""],
            address1: ["", [Validators.required, Validators.maxLength(100)]],
            address2: ["", [Validators.maxLength(100)]],
            address3: ["", [Validators.maxLength(100)]],
            city: ["", [Validators.required, Validators.maxLength(30)]],
            postcode: ["", [Validators.required, Validators.maxLength(10)]],
            county: [""],
            stateProvinceCode: [""],
            countryId: [""],
            country: ["", [Validators.required, AutocompleteSelectedValidator]],
            isPrimaryLocation: [""],
            postcodeSearch: [""],
        });

        this.initialiseData();

        //initialise the form
        this.addressForm.patchValue(
            {
                clientLocationId: 0,
                clientId: this.dialogModel.client.id,
                country: this.defaultCountry,
                isPrimaryLocation: false,
                stateProvinceCode: "",
            },
        );

        if (this.dialogModel.dbOperation === DBOperation.update) {
            this.addressForm.patchValue(
                {
                    clientLocationId: this.dialogModel.editLocation.clientLocationId,
                    address1: this.dialogModel.editLocation.address1,
                    address2: this.dialogModel.editLocation.address2,
                    address3: this.dialogModel.editLocation.address3,
                    city: this.dialogModel.editLocation.city,
                    postcode: this.dialogModel.editLocation.postcode,
                    county: this.dialogModel.editLocation.county,
                    isPrimaryLocation: this.dialogModel.editLocation.isPrimaryLocation,
                }
            );
        }
    }

    public initialiseData() {

        //default country when add is the inssured country
        this.defaultCountry = this.dropDownManagerService.setDropDownItem<Country>(
            (this.dialogModel.dbOperation === DBOperation.update)
                ? this.dialogModel.editLocation.country
                : this.dialogModel.defaultLocation,
            this.dropDownManagerService.setCountryDropDownItem);

        //dropdown filters
        this.dbFilter = new AutocompleteRequest();
        this.postcodeLookup = this.dropdownService.getAutocompleteAddresses(this.dbFilter);
        this.countries = this.dropdownService.getCountries();

        if (this.defaultCountry) {
            this.countryStates = this.dropdownService.getCountryStates(this.defaultCountry.hidden);
            this.showState = this.countriesWithStates.some((p) => p === this.defaultCountry.hidden);
        }

        //subscribe
        this.subscribeActions();
    }

    public ngAfterViewInit() {
        this.ddlPostcode.type = DropDownTypes.dynamic;
        this.ddlStateProvinceCode.type = DropDownTypes.static;
    }

    public ngAfterContentInit() {

        const editMode = this.dialogModel.dbOperation === DBOperation.update;

        if (this.defaultCountry) {
            this.dropdownService.getCountryStates(this.defaultCountry.hidden).pipe(first()).subscribe((values) => {
                if (this.ddlStateProvinceCode) {
                    this.ddlStateProvinceCode.allOptions = values;
                }
            },
                (error) => { console.log(error); },
                () => {
                    if (this.ddlStateProvinceCode && this.showState) {
                        const state = this.ddlStateProvinceCode.allOptions.find(
                            (p) => p.value === ((editMode) ? this.dialogModel.editLocation.stateProvinceCode : ""));
                        if (editMode) {
                            this.addressForm.patchValue({
                                stateProvinceCode: new DropDownItem(
                                    (state) ? state.text : this.dialogModel.editLocation.stateProvinceCode,
                                    this.dialogModel.editLocation.stateProvinceCode,
                                    "",
                                    this.dialogModel.editLocation.country.countryId.toString()),
                            });
                        }
                    }
                },
            );
        }

        this.dropdownService.getCountries().pipe(first()).subscribe((values) => {
            if (this.ddlCountry) {
                this.ddlCountry.allOptions = values;
            }
        },
            (error) => { console.log(error); }
        );

        if (this.showState) {
            const stateProvinceCode = this.addressForm.get("stateProvinceCode");
            stateProvinceCode.setValidators([Validators.required, AutocompleteSelectedValidator]);
            stateProvinceCode.updateValueAndValidity();
        }
    }

    ngOnDestroy(): void {
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }

        if (this.postCodeSubscription) {
            this.postCodeSubscription.unsubscribe();
        }

        if (this.placeDetailsSubscription) {
            this.placeDetailsSubscription.unsubscribe();
        }
    }

    public onValueChanged(): boolean {
        let retVal = true;
        if (!this.addressForm) { return; }
        const form = this.addressForm;

        // tslint:disable-next-line: forin
        for (const field in this.formErrors) {
            // clear previous error message (if any)
            this.formErrors[field] = "";
            const control = form.get(field);

            if (control && !control.valid && control.dirty && (control.dirty || control.touched)) {
                const messages = this.validationMessages[field];
                // tslint:disable-next-line: forin
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + " ";
                    retVal = false;
                }
            }
        }

        return retVal;
    }

    public onSubmit(formData: any, event: any) {

        if (!event) {
            event.preventDefault();
        }

        if (!this.validateFormFields()) {
            return false;
        }

        switch (this.dialogModel.dbOperation) {
            case DBOperation.create:
                this.locationHttpService.add(formData.value)
                    .subscribe(
                        (data) => {
                            if (data.succeeded === true) {
                                this.dialogRef.close("success");
                            } else {
                                console.log(data.message);
                                //this.dialogRef.close("error");
                            }
                        },
                        (error) => {
                            //this.dialogRef.close("error");
                        }
                    );
                break;
            case DBOperation.update:

                this.locationHttpService.update(formData.value)
                    .subscribe(
                        (data) => {
                            if (data.succeeded === true) {
                                this.dialogRef.close("success");
                            } else {
                                console.log(data.message);
                                //this.dialogRef.close("error");
                            }
                        },
                        (error) => {
                            //this.dialogRef.close("error");
                        }
                    );
                break;

        }
    }

    public has(object, key) {
        return object ? Object.prototype.hasOwnProperty.call(object, key) : false;
    }

    public validateFormFields(): boolean {

        if (this.showState) {
            const stateProvinceCode = this.addressForm.get("stateProvinceCode");
            stateProvinceCode.updateValueAndValidity();
        }

        this.markFormGroupAsTouched(this.addressForm);
        if (!this.onValueChanged()) {
            return false;
        }

        return true;
    }

    public setAutocompleteRequest(event: any, type: string = "geocode") {
        const self = this;
        if (event) {
            event.stopPropagation();
        }

        if (!this.addressForm) {
            return;
        }
        const postcode = this.addressForm.get("postcodeSearch");
        if (postcode.value.text) {
            this.dbFilter.input = this.addressForm.get("postcodeSearch").value.text;
        } else {
            this.dbFilter.input = this.addressForm.get("postcodeSearch").value;
        }

        this.dbFilter.types = type;

        this.ddlPostcode.setDataSource(this.dropdownService.getAutocompleteAddresses(this.dbFilter));

    }

    public postcodeChanged(data: any) {

        if (!data.hidden) { return; }

        let address = null;
        this.placeDetailsSubscription = this.locationHttpService.getPlaceDetailsAddress(data.hidden).subscribe(
            (value) => { address = value; },
            (error) => { console.log(error); },
            () => { this.setAddressFields(address); },
        );

    }

    public setAddressFields(address: PlaceResult) {
        if (!this.addressForm) { return; }

        let addressLine1 = "";
        let city = "";
        let stateCode = "";
        let stateName = "";
        let postcode = "";
        let county = "";
        let country = null;
        let stateProvinceCode = null;

        if (!address) { return; }

        address.result.address_Components.map((p) => {
            if (p.types.find((x) => x === "floor")) {
                addressLine1 += `${p.long_name}`;
            }

            if (p.types.find((x) => x === "street_number")) {
                addressLine1 += ` ${p.long_name}`;
            }

            if (p.types.find((x) => x === "route")) {
                addressLine1 += ` ${p.long_name}`;
            }

            if (p.types.find((x) => x === "administrative_area_level_1")) {
                stateCode = `${p.short_name}`;
                stateName = `${p.long_name}`;
            }

            if (p.types.find((x) => x === "administrative_area_level_2")) {
                county = `${p.long_name}`;
            }

            if (p.types.find((x) => x === "postal_town")) {
                city = `${p.long_name}`;
            } else {
                if (p.types.find((x) => x === "locality")) {
                    city = `${p.long_name}`;
                }
            }

            if (p.types.find((x) => x === "postal_code")) {
                postcode = `${p.long_name}`;
            }

            if (p.types.find((x) => x === "country")) {
                if (this.ddlCountry.allOptions) {
                    country = this.ddlCountry.allOptions.find((x) => x.hidden === `${p.short_name}`);
                    this.showState = this.countriesWithStates.some((x) => x === `${p.short_name}`);
                }

            }

        });

        if (this.showState) {
            if (country?.hidden == "AU"){
                if (stateCode == "WA") stateCode = "WeA";
                else if (stateCode == "NT") stateCode = "NoT";
            }
            stateProvinceCode = new DropDownItem(stateName, stateCode, "", "");
        } else {
            stateProvinceCode = new DropDownItem("", "", "", "");
        }

        this.addressForm.patchValue({
            address1: addressLine1,
            address2: "",
            address3: "",
            city,
            postcode,
            county,
            country,
        });

        this.addressForm.get("stateProvinceCode").setValue(stateProvinceCode);
        this.ddlStateProvinceCode.onFocus();

        this.markFormGroupAsTouched(this.addressForm);
        this.onValueChanged();
    }

    public countryChanged(data: any) {
        if (!data.hidden) {
            this.addressForm.get("countryId").setValue(-1);
            return;
        } else {
            this.addressForm.get("countryId").setValue(data.value);
        }

        this.showState = this.countriesWithStates.some((p) => data.hidden &&
            p === data.hidden.toString(),
        );

        this.setAutocompleteRequest(null);
        this.addressForm.get("postcodeSearch").setValue("");

        const stateProvinceCode = this.addressForm.get("stateProvinceCode");
        if (this.showState) {
            this.ddlStateProvinceCode.setDataSource(
                this.dropdownService.getCountryStates(data.hidden));

            stateProvinceCode.setValue("");
            stateProvinceCode.setValidators([Validators.required, AutocompleteSelectedValidator]);

        } else {
            stateProvinceCode.setValidators(null);
            this.addressForm.get("stateProvinceCode").setValue("");
        }
        stateProvinceCode.updateValueAndValidity();

    }

    public subscribeActions() {
        this.formSubscription = this.addressForm.valueChanges.subscribe((data) => this.onValueChanged());
        this.postCodeSubscription = this.addressForm.get("postcodeSearch").valueChanges.subscribe((a) => this.setAutocompleteRequest(null));
    }

    private markFormGroupAsTouched(formGroup: FormGroup) {
        (Object as any).values(formGroup.controls).forEach((control) => {
            control.markAsTouched();
            control.markAsDirty();

            if (control.controls) {
                control.controls.forEach((c) => this.markFormGroupAsTouched(c));
            }
        });
    }

}
