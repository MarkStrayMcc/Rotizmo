import { MatDialogExtension } from "../MatDialogExtension";

export class MtaLossPayeeModalConfig {
    public static dialog: MatDialogExtension = {
        matDialogConfig: {
            panelClass: "modalMtaLossPayee",
            height: "auto",
            width: "980px",
            disableClose: false,
            hasBackdrop: true,
        },
        maxHeight: 1000,
        maxWeight: 590,
        increaseStep: 45,
        startStep: 612
    };
}
