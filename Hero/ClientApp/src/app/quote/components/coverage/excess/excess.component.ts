import { Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { LeadExcessConfiguration } from "@app/models/extendedModels/LeadExcessConfiguration";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import { CoverageExcess, Currency } from "@app/models";
import { CoverageCalculationService } from "@app/services/coverage-calculation.service";

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ExcessComponent)
        }],
    selector: "excess",
    styleUrls: ["./excess.component.scss"],
    templateUrl: "./excess.component.html"
})
export class ExcessComponent implements ControlValueAccessor, OnInit, IsValid, MarkAsTouched {
    @Input() public isSelected: boolean = false;
    @Input() public currency: Currency = {
        id: 1,
        isoCode: "GBP",
        name: "pound",
        symbol: "£",
        rate: 1.0
    };
    @Input() public readonly: boolean = false;
    
    @Output() public setForm = new EventEmitter<FormGroup>();

    @ViewChild("excessvalue") public excessvalue: CurrencyComponent;
    public form: FormGroup;
    public basisKeys: string[];
    private value: CoverageExcess;
    private changeEvent: any;
    private touchEvent: any;
    private leadConfiguration: LeadExcessConfiguration = null;
    private previousLeaderValue: number = null;
    private previousLeaderExcessBasis: number = null;

    constructor(protected fb: FormBuilder,
        private coverageCalculationService: CoverageCalculationService) { }

    public ngOnInit(): void {
        this.form = this.fb.group(
            {
                excessBasis: ["", [Validators.min(1)]],
                excessValue: [""]
            });
        this.basisKeys = Object.keys(this.excess.excessType.availableExcessBasis);

        if (this.readonly) {
            this.form.disable();
        }

        this.setForm.emit(this.form);
    }

    @Input()
    set leadExcessConfiguration(config: LeadExcessConfiguration) {
        if (config) {
            this.leadConfiguration = config;

            this.previousLeaderValue = this.coverageCalculationService.calculateLeadExcessValue(config);
            this.previousLeaderExcessBasis = config.leaders[0].excessBasisId;
        }
    }

    @Input()
    set leadExcessValue(newValue: number) {
        const isValidExcessValue = newValue !== null && !isNaN(newValue);
        if (!isValidExcessValue || !this.form || !this.leadConfiguration) {
            return;
        }

        const finalNewValue = Math.round(newValue * this.leadConfiguration.multiplicationFactor);
        const leadDefault = this.coverageCalculationService.calculateLeadDefaultExcessValue(this.leadConfiguration);
        const excessDefault = this.value.excessType.defaultExcess;

        const shouldFollow = !isNaN(this.previousLeaderValue)
            && this.previousLeaderValue === this.value.excess
            && leadDefault === excessDefault;
        
        if (shouldFollow) {
            this.value.excess = finalNewValue;
        }
        this.previousLeaderValue = finalNewValue;
    }

    @Input()
    set leadExcessBasis(excessBasisId: number) {
        const isValidLimitBasis = excessBasisId !== null && !isNaN(excessBasisId);
        if (!isValidLimitBasis || !this.form || !this.leadConfiguration) {
            return;
        }
        const leadDefault = this.leadConfiguration.leaders[0].excessType.defaultExcessBasis;
        const limitDefault = this.value.excessType.defaultExcessBasis;

        const shouldFollow = this.previousLeaderExcessBasis
            && this.previousLeaderExcessBasis === this.value.excessBasisId
            && leadDefault === limitDefault;

        if (shouldFollow) {
            this.value.excessBasisId = excessBasisId;
        }
        this.previousLeaderExcessBasis = excessBasisId;
    }

    @Input()
    set excess(val: CoverageExcess) {
        this.value = val;
        if (this.changeEvent) {
            this.changeEvent(val);
        }
    }

    get excess(): CoverageExcess {
        return this.value;
    }

    public isValid(): boolean {
        if (this.readonly) { return true; }
        return this.form.get("excessBasis").valid &&
            this.excessvalue.isValid();
    }

    public markAsTouched(): void {
        Object.keys(this.form.controls)
            .map((key) => this.form.controls[key])
            .forEach((control) => {
                control.markAsTouched();
            });
        this.excessvalue.markAsTouched();    }

    public excessBasisError(): boolean {
        if (this.form) {
            const control = this.form.get("excessBasis");
            return this.isSelected &&
                control.touched &&
                !this.excess.excessBasisId;
        }
        return false;
    }

    public writeValue(obj): void {
        this.excess = obj;
    }

    public registerOnChange(fn): void {
        this.changeEvent = fn;
    }

    public registerOnTouched(fn): void {
        this.touchEvent = fn;
    }

    public setDisabledState(isDisabled: boolean) {
        this.readonly = isDisabled;
    }
}
