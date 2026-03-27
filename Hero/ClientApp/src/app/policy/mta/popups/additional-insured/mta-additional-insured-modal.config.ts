import { MatDialogExtension } from "../MatDialogExtension";

export class MtaAdditionalInsuredModalConfig {
    public static dialog: MatDialogExtension = {
        matDialogConfig: {
            panelClass: "modalMtaAdditionalInsured",
            height: "auto",
            width: "900px",
            disableClose: false,
            hasBackdrop: true,
        },
        maxHeight: 1000,
        maxWeight: 590,
        increaseStep: 45,
        startStep: 612
    };
}
