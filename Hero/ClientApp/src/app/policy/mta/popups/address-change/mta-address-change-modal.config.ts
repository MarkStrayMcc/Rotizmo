import { MatDialogExtension } from "../MatDialogExtension";

export class MtaAddressChangeModalConfig {
    public static dialog: MatDialogExtension = {
        matDialogConfig: {
            panelClass: "modalClientManageAddress",
            width: "600px",
            disableClose: false,
            hasBackdrop: true,
        },
        maxHeight: 1000,
        maxWeight: 590,
        increaseStep: 45,
        startStep: 612
    };
}
