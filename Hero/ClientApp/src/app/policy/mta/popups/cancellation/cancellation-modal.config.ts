import { MatDialogExtension } from "../MatDialogExtension";

export class MtaCancellationModalConfig {
    public static dialog: MatDialogExtension = {
        matDialogConfig: {
            panelClass: "modalMtaCancellation",
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
