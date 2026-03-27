import { MtaType } from "@app/policy/models/MtaType";
import { MtaAdditionalInsuredModalConfig } from "./popups/additional-insured/mta-additional-insured-modal.config";
import { MtaAddressChangeModalConfig } from "./popups/address-change/mta-address-change-modal.config";
import { MtaCancellationModalConfig } from "./popups/cancellation/cancellation-modal.config";
import { MtaNameChangeModalConfig } from "./popups/client-name-change/mta-client-name-change-modal.config";
import { MtaLossPayeeModalConfig } from "./popups/loss-payee/mta-loss-payee-modal.config";
import { MtaManualChangeMtaConfig } from "./popups/manual-mta/mta-manual-mta-modal.config";

export const MtaNames = {
    nameChange: "Name Change",
    addressChange: "Address Change",
    additionalInsured: "Additional Insured",
    lossPayee: "Loss Payee",
    cancellation: "Cancellation",
    manualMta: "Register Manual MTA"
}

export class MtaSelectionConfig {
    public static mtaTypes: MtaSelectionType[] = [
        {
            displayName: MtaNames.nameChange,
            iconName: "account_circle",
            featureName: "heroNameChangeMta",
            modalConfig: MtaNameChangeModalConfig
        },
        {
            displayName: MtaNames.addressChange,
            iconName: "edit_location",
            modalConfig: MtaAddressChangeModalConfig
        },
        {
            displayName: MtaNames.additionalInsured,
            iconName: "group_add",
            featureName: "heroAdditionalInsuredMta",
            modalConfig: MtaAdditionalInsuredModalConfig
        },
        {
            displayName: MtaNames.lossPayee,
            iconName: "person_add",
            featureName: "heroLossPayeeMta",
            modalConfig: MtaLossPayeeModalConfig
        },
        {
            displayName: MtaNames.cancellation,
            iconName: "cancel",
            featureName: "heroCancellationMta",
            modalConfig: MtaCancellationModalConfig
        },
        {
            displayName: MtaNames.manualMta,
            iconName: "app_registration",
            featureName: "heroManualChangeMta",
            modalConfig: MtaManualChangeMtaConfig
        }
    ]
}

export class MtaSelectionType extends MtaType {
    public featureName?: string;
    public componentName?: any;
    public modalConfig?: any;
}
