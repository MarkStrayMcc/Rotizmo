import { MatDialogExtension } from "../MatDialogExtension";

export class MtaConfirmationModalConfig {
    public static dialog: MatDialogExtension = {
        matDialogConfig: {
            panelClass: "modalMtaConfirmation",
            height: "auto",
            width: "800px",
            disableClose: false,
            hasBackdrop: true,
        },
        maxHeight: 1000,
        maxWeight: 590,
        increaseStep: 45,
        startStep: 612
    };
}
