import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { Quote } from "@app/models";
import { Guid } from "guid-typescript";
import { first } from "rxjs/operators";
import { InsuredAddressService } from "./property-limit/insured-address/insured-address.service";
import { PropertyLimit } from "../../../../models/property-limit.model";
import { PropertyLimitViewModel } from "./property-limit/property-limit.view-model";

declare module "@angular/forms" {
    export interface AbstractControl extends PropertyLimitViewModel { }
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "multiple-property",
    styleUrls: ["multiple-property.component.scss"],
    templateUrl: "multiple-property.component.html",
})
export class MultiplePropertyComponent implements OnInit {
    @Input() readonly quote: Quote;

    public readonly formGroup: FormGroup;

    get propertyLimits() { return this.formGroup.controls.propertyLimits as FormArray; }
    get isSaveButtonDisabled() {
        return this.propertyLimits.length === 0 || this.propertyLimits.controls.some(control => control.isEditing);
    }

    constructor(
        private readonly dialogRef: MatDialogRef<MultiplePropertyComponent>,
        private readonly insuredAddressService: InsuredAddressService
    ) {
        this.formGroup = new FormGroup({ propertyLimits: new FormArray([]) });
    }

    ngOnInit(): void {
        this.getInsuredAddresses();
        this.createPropertyLimitControls();
    }

    public edit = (id: Guid, isEditing: boolean): void => {
        for (const control of this.propertyLimits.controls) {
            if (control.id !== id && control.isNew) {
                this.delete(control.id);
            }
            else {
                control.isNew = isEditing ? control.isNew : false;
                control.isEditing = id === control.id ? isEditing : false;
            }
        }
    }

    public create = async (): Promise<void> => {
        if (this.propertyLimits.controls.some(control => control.isNew)) {
            return;
        }

        const control = new FormControl(new PropertyLimit());

        control.id = Guid.create();
        control.isNew = true;

        this.propertyLimits.push(control);
        this.edit(control.id, true);
    }

    public save = (): void => {
        this.quote.propertyLimits = this.propertyLimits.value;
        this.dialogRef.close(this.quote);
    }

    public delete = (id: Guid): void => {
        const index = this.propertyLimits.controls.findIndex(control => control.id === id);
        this.propertyLimits.removeAt(index);
    }

    public close = (): void => {
        this.dialogRef.close();
    }

    private createPropertyLimitControls = (): void => {
        for (const propertyLimit of this.quote.propertyLimits || []) {
            const control = new FormControl(propertyLimit);

            control.id = Guid.create();

            this.propertyLimits.push(control);
        }
    }

    private getInsuredAddresses = (): void => {
        this.insuredAddressService.get(this.quote.client.id).pipe(first()).subscribe();
    }
}
