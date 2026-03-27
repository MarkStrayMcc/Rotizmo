import { SharedMatDialogExtension } from "../SharedMatDialogExtension";

export class ConfirmationModalConfig {
    public static dialog: SharedMatDialogExtension = {
        matDialogConfig: {
            panelClass: "modalConfirmation",
            height: "auto",
            width: "500px",
            disableClose: false,
            hasBackdrop: true,
        },
        maxHeight: 1000,
        maxWeight: 590,
        increaseStep: 45,
        startStep: 612
    };
}
