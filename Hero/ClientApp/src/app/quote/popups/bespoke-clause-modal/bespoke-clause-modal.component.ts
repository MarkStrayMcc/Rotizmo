import { Component, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import * as Models from "@app/models";
import { duplicateValidator } from "@app/validators/duplicate.validator";

@Component({
    selector: "bespoke-clause-modal",
    templateUrl: "./bespoke-clause-modal.component.html",
    styleUrls: ["./bespoke-clause-modal.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BespokeClauseModalComponent),
            multi: true
        }
    ]
})
export class BespokeClauseModalComponent implements ControlValueAccessor {
    public bespokeClause: Models.QuoteBespokeClauseExtended = new Models.QuoteBespokeClauseExtended();
    public result: Models.QuoteBespokeClauseExtended;
    public bespokeClauseForm: FormGroup;
    public currentTitles: string[] = [];
    public readOnly: boolean = true;

    private onChangeEvent: any;
    private onTouchEvent: any;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly dialogRef: MatDialogRef<BespokeClauseModalComponent>) {
    }

    public ngOnInit() {
        this.bespokeClauseForm = this.createFormGroup();
    }

    // implementing ControlValueAccessor
    public writeValue(obj: any): void {
        this.bespokeClause = obj;
    }

    public registerOnChange(fn: any): void {
        this.onChangeEvent = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouchEvent = fn;
    }

    public onCloseModal() {
        this.dialogRef.close(this.result);
    }

    public save(model: any, isValid: boolean) {
        if (isValid) {
            this.result = model;
            this.result.key = this.bespokeClause.key;
            this.onCloseModal();
        }
    }

    private createFormGroup(): FormGroup {
        const formGroup = this.formBuilder.group({
            clauseTitle: [
                this.bespokeClause.clauseTitle, [
                    Validators.required,
                    duplicateValidator(this.currentTitles)
                ]
            ],
            clauseText: [this.bespokeClause.clauseText, Validators.required]
        });
        if (this.readOnly) {
            formGroup.disable();
        } else {
            formGroup.enable();
        }

        return formGroup;
    }
}
