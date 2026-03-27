import { ComponentType } from "@angular/cdk/portal";
import { Injectable } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { first } from "rxjs/operators";

@Injectable()
export class ModalDialogService {
    constructor(private readonly dialog: MatDialog) { }

    public openDialog<T, TY>(
        componentOrTemplateRef: ComponentType<T>,
        config: MatDialogConfig,
        setDialogComponent: (T) => void,
        afterClose: (obj: TY) => void,
        onChangeSub?: (T) => Subscription
    ) {
        const dialogRef = this.dialog.open(componentOrTemplateRef, config);
        setDialogComponent(dialogRef.componentInstance);

        let onChangeSubscription = null;
        if (onChangeSub) {
            onChangeSubscription = onChangeSub(dialogRef.componentInstance);
        }

        dialogRef.afterClosed().pipe(first()).subscribe(result => {
            if (afterClose) {
                afterClose(result);
            }

            if (onChangeSubscription) onChangeSubscription.unsubscribe();
        });
    }
}
