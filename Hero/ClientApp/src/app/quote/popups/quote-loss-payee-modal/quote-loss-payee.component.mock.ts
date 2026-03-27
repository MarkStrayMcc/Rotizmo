import { LossPayee } from "@app/models/auto-generated/LossPayee";
import { InterestOfEntity } from "@app/models/InterestOfEntity";
import { DropDownField } from "@app/shared/form-creator/form-creator.config";

export const mockLossPayee: LossPayee = {
    entityName: "testName",
    interestOfEntity: InterestOfEntity.Landlord as any,
    contactEmail: "",
    addressLine1: "line1",
    addressLine2: "",
    addressLine3: "",
    city: "city",
    postcode: "",
    county: "",
    stateProvinceIsoCode: "",
    countryIsoCode: ""
}

export const mockLossPayeeConfigBuilder = {
    setConfig: jasmine.createSpy().and.returnValue(
        {
            groups: [
                {
                    fields: [
                        new DropDownField({
                            property: "interestOfEntity",
                            enum: InterestOfEntity,
                            value: ""
                        })
                    ]
                }
            ]
        })
};

