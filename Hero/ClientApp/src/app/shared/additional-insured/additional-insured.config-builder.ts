import { Injectable } from "@angular/core";
import { Validators } from "@angular/forms";
import { DropDownField, FieldValidator, FormButton, FormButtonTypes, FormConfig, TextBoxField, TemplateType } from "@app/shared/form-creator/form-creator.config";
import { of } from "rxjs";

@Injectable()
export class AdditionalInsuredConfigBuilder {

    public setConfig(countries: any[], country?: any): FormConfig {
        return {
            selector: "additional-insured",
            template: TemplateType.TwoColumns,
            groups: [
                {
                    title: "All other fields",
                    fields: [
                        new TextBoxField({
                            cssClass: "additional-insured-entity-name",
                            label: "Entity name",
                            property: "entityName",
                            validators: [
                                new FieldValidator({
                                    selector: "required",
                                    message: "Required",
                                    validator: Validators.required
                                }),
                            ]
                        }),
                        new TextBoxField({
                            cssClass: "additional-insured-contact-email",
                            label: "Contact email",
                            property: "contactEmail",
                            validators: [
                                new FieldValidator({
                                    selector: "pattern",
                                    message: "Invalid email address",
                                    validator: Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")
                                })
                            ]
                        }),
                        new TextBoxField({
                            cssClass: "additional-insured-address-line-1",
                            label: "Address line 1",
                            property: "addressLine1"
                        }),
                        new TextBoxField({
                            cssClass: "additional-insured-address-line-2",
                            label: "Address line 2",
                            property: "addressLine2"
                        }),
                        new TextBoxField({
                            cssClass: "additional-insured-address-line-3",
                            label: "Address line 3",
                            property: "addressLine3"
                        }),
                        new TextBoxField({
                            cssClass: "additional-insured-city",
                            label: "City",
                            property: "city"
                        }),
                        new TextBoxField({
                            cssClass: "additional-insured-county",
                            label: "County",
                            property: "county"
                        }),
                        new TextBoxField({
                            cssClass: "additional-insured-state",
                            label: "State",
                            property: "stateProvinceIsoCode"
                        }),
                        new TextBoxField({
                            cssClass: "additional-insured-post-code",
                            label: "Post code",
                            property: "postcode"
                        }),
                        new DropDownField({
                            cssClass: "additional-insured-country",
                            label: "Country",
                            property: "countryIsoCode",
                            requestData: of(countries),
                            value: country
                        })
                    ],
                    hasSeparatorLine: false
                }
            ],
            fields: [],
            buttons: [
                new FormButton({
                    cssClass: "additional-insured-add md-mr2",
                    property: "additional-insured-add",
                    label: "Add",
                    type: FormButtonTypes.Submit,
                    disable: false
                })
            ]
        };
    }

}
