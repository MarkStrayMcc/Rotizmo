import { EventEmitter, Input, OnDestroy, Output, Directive } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { IsDirty } from "@app/interfaces/IsDirty";
import { IsLoaded } from "@app/interfaces/IsLoaded";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import { Quote, QuoteState } from "@app/models";
import { ButtonStatus } from "@app/quote/view-models/ButtonStatus";
import { Subject } from "rxjs";

@Directive()
export abstract class BaseStepComponent implements IsValid, IsDirty, IsLoaded, MarkAsTouched, OnDestroy {
    @Input() public set readonly(value: boolean) {
        this.readonlyValue = value;

        if (!this.stepForm) {
            return;
        }

        if (value) {
            this.stepForm.disable({ emitEvent: false });
        } else {
            this.stepForm.enable({ emitEvent: false });
        }
    }

    @Input() public originalQuote: Quote;
    @Input() public vm: Quote;
    @Input() public stepNr: number;
    
    @Output() public onValid = new EventEmitter<boolean>();
    @Output() public onChange = new EventEmitter<ButtonStatus>();
    @Output() public onInitialise = new EventEmitter();
    @Output() public onLoadCompleted = new EventEmitter();
    @Output() public onWarningChange = new EventEmitter<boolean>();

    public stepForm: FormGroup;
    public buttonStatus = { canSaveAfterRecalculate: true, allowRecalculate: true }  as ButtonStatus;
    public get readonly(): boolean {
        return this.readonlyValue;
    }

    protected loaded: boolean = false;
    protected readonly destroyed$ = new Subject<void>();
    
    private readonlyValue: boolean = false;

    public isLoaded(): boolean {
        return this.loaded;
    }

    public isValid(): boolean {
        return this.stepForm.disabled || this.stepForm.valid;
    }

    public isDirty(): boolean {
        return this.stepForm.dirty;
    }

    public markAsTouched() {
        this.stepForm.controls.riskQuestionAnswers.markAsTouched();
    }

    public setChange() {
        if (this.vm.state === QuoteState.InProgress) {
            this.onChange.emit(this.buttonStatus);
        }
    }

    protected setInitialise() {
        this.onInitialise.emit();
    }

    protected setLoadCompleted() {
        this.onLoadCompleted.emit();
    }

    public ngOnDestroy(): void {
        this.onValid.emit(this.isValid());
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public setWarning(hasWarning: boolean) {
        this.onWarningChange.emit(hasWarning);
    }
}
