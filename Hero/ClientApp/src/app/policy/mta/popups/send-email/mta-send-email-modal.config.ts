import { MatDialogExtension } from "../MatDialogExtension";

export class MtaSendEmailModalConfig {
    public static dialog: MatDialogExtension = {
        matDialogConfig: {
            panelClass: "sendMta",
            backdropClass: "cdk-overlay-transparent-backdrop",
            width: "1000px",
            disableClose: false,
            hasBackdrop: true,
        },
        maxHeight: 1000,
        maxWeight: 590,
        increaseStep: 45,
        startStep: 612
    };
}
