import { Injectable } from "@angular/core";
import { Validators } from "@angular/forms";
import { DropDownField, FieldValidator, FormButton, FormButtonTypes, FormConfig, TextBoxField, TemplateType } from
    "@app/shared/form-creator/form-creator.config";
import { of } from "rxjs";
import { InterestOfEntity } from "@app/models/InterestOfEntity";

@Injectable()
export class LossPayeeConfigBuilder {

    public setConfig(countries: any[], country?: any): FormConfig {
        return {
            selector: "loss-payee",
            template: TemplateType.TwoColumns,
            groups: [
                {
                    title: "All other fields",
                    fields: [
                        new TextBoxField({
                            cssClass: "loss-payee-entity-name",
                            label: "Entity name",
                            property: "entityName",
                            validators: [
                                new FieldValidator({
                                    selector: "required",
                                    message: "Required",
                                    validator: Validators.required
                                })
                            ]
                        }),
                        new DropDownField({
                            cssClass: "loss-payee-interest-of-entity",
                            label: "Interest of entity",
                            property: "interestOfEntity",
                            enum: InterestOfEntity,
                            validators: [
                                new FieldValidator({
                                    selector: "required",
                                    message: "Required",
                                    validator: Validators.required
                                })
                            ]
                        }),
                        new TextBoxField({
                            cssClass: "loss-payee-contact-email",
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
                            cssClass: "loss-payee-address-line-1",
                            label: "Address line 1",
                            property: "addressLine1"
                        }),
                        new TextBoxField({
                            cssClass: "loss-payee-address-line-2",
                            label: "Address line 2",
                            property: "addressLine2"
                        }),
                        new TextBoxField({
                            cssClass: "loss-payee-address-line-3",
                            label: "Address line 3",
                            property: "addressLine3"
                        }),
                        new TextBoxField({
                            cssClass: "loss-payee-city",
                            label: "City",
                            property: "city"
                        }),
                        new TextBoxField({
                            cssClass: "loss-payee-county",
                            label: "County",
                            property: "county"
                        }),
                        new TextBoxField({
                            cssClass: "loss-payee-state",
                            label: "State",
                            property: "stateProvinceIsoCode"
                        }),
                        new TextBoxField({
                            cssClass: "loss-payee-post-code",
                            label: "Post code",
                            property: "postcode"
                        }),
                        new DropDownField({
                            cssClass: "loss-payee-country",
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
                    cssClass: "loss-payee-add md-mr2",
                    property: "loss-payee-add",
                    label: "Add",
                    type: FormButtonTypes.Submit,
                    disable: false
                })
            ]
        };
    }
}
