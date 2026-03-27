import { Component, EventEmitter, forwardRef, Input, Output } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from "@angular/forms";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import { Currency } from "@app/models";

@Component({
	selector: "currency",
	templateUrl: "./currency.component.html",
	styleUrls: ["./currency.component.scss"],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => CurrencyComponent),
			multi: true,
		},
	],
})
export class CurrencyComponent implements ControlValueAccessor, IsValid, MarkAsTouched {
	@Input() public inputName: string = "currency";
	@Input() public hasWarning: boolean = false;
	@Input() public warningText: string;
	@Input() public decimals: boolean = false;
	@Input() public negatives: boolean = false;
	@Input() public readonly: boolean = false;
	@Input() minValue: number | null = null;
	@Input() public isRequired: boolean = false;

	@Input() public currency: Currency = {
		id: 1,
		symbol: "£",
		isoCode: "GBP",
		name: "pound",
		rate: 1.0,
	};

	@Input()
	public set value(val) {
		this.valueStorage = val;
		this.valueChange.emit(this.value);

		if (this.onChangeEvent) {
			this.onChangeEvent(val);
		}
	}

	public get value() {
		return this.valueStorage;
	}

	@Output() public valueChange = new EventEmitter<number>();
	@Output() public userValueChange = new EventEmitter(); //This is a fix and should be removed once the coverages step is made reactive!
	@Output() public focus = new EventEmitter<boolean>();
	@Output() public setForm = new EventEmitter<FormGroup>();
	@Output() public blur = new EventEmitter();

	public isDisabled: boolean = false;
	public form: FormGroup;
	public control: AbstractControl;

	private valueStorage: number;
	private onChangeEvent: any;
	private onTouchEvent: any;

	constructor(protected fb: FormBuilder) {}

	// implementing ControlValueAccessor
	public writeValue(obj: any): void {
		this.value = obj;
	}

	public registerOnChange(fn: any): void {
		this.onChangeEvent = fn;
	}

	public registerOnTouched(fn: any): void {
		this.onTouchEvent = fn;
	}

	public setDisabledState(isDisabled: boolean) {
		this.isDisabled = isDisabled;
		if (isDisabled) {
			this.form.disable();
		} else {
			this.form.enable();
		}
	}

	public ngOnInit(): void {
		this.form = this.fb.group({ value: new FormControl(this.value, [Validators.min(this.minValue)]) });

		if (this.form) {
			this.control = this.form.get("value");
			this.setForm.emit(this.form);
		}
	}

	public onValueChanged(data: number): void {
		if (!data && data !== 0) {
			data = null;
		}

		this.value = data;

		if (this.control.dirty) {
			this.userValueChange.emit(); // This is not reactive and should be removed when the coverages step is made reactive!
		} // It is here to break a follow once a field has been manually changed in the UI.
	}

	public blurred() {
		this.blur.emit();
		this.focus.emit(false);

		if (this.onTouchEvent) {
			this.onTouchEvent();
		}
	}

	public focussed() {
		this.focus.emit(true);
	}

	public isValid(): boolean {
		if (!this.control) {
			return false;
		}
		if (this.control.valid === false && this.control.errors?.min && this.minValue === null) {
			this.setMinValueValidator(this.minValue);
		}
		return this.control.valid;
	}

	public markAsTouched(): void {
		if (this.control) {
			this.control.markAsTouched();
		}
	}

	public setMinValueValidator(value: number | null) {
		if (value === null) {
			this.control.removeValidators([Validators.min(value)]);
			this.control.updateValueAndValidity();
			let errors = this.control.errors;
			if (errors && errors.min) {
				delete errors.min;
				this.control.setErrors(errors.length > 0 ? errors : null);
			}
		} else {
			this.control.addValidators([Validators.min(value)]);
			this.control.updateValueAndValidity();
		}
		this.setForm.emit(this.form);
	}
}
