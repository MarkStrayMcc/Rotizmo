import { MatDialogExtension } from "../MatDialogExtension";

export class MtaNameChangeModalConfig {
    public static dialog: MatDialogExtension = {
        matDialogConfig: {
            panelClass: "modalMtaNameChange",
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
