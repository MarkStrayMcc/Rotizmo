import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Currency } from "@app/models";
import { QuoteService } from "@app/quote/services/quote.service";
import { CoverageService } from "@app/services/coverage.service";
import { markAllAsTouched } from "@app/shared/functions/markAllAsTouched";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { InsuredAddressService } from "./insured-address/insured-address.service";
import { PropertyLimitsValidator } from "./property-limits-validator";
import { PropertyLimit } from '@app/quote/models/property-limit.model';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: "property-limit",
	styleUrls: ["property-limit.component.scss"],
	templateUrl: "property-limit.component.html",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			multi: true,
			useExisting: forwardRef(() => PropertyLimitComponent),
		},
	],
})
export class PropertyLimitComponent implements ControlValueAccessor, OnDestroy, OnInit {
	@Input() readonly currency: Currency;
	@Input() readonly isNew: boolean;
	@Input() set isEditing(value: boolean) {
		this._isEditing = value;
		this.formGroup.patchValue(this._committedPropertyLimit);
	}

	@Output() readonly deleted = new EventEmitter();
	@Output() readonly editing = new EventEmitter<boolean>();

	public formGroup: FormGroup;
	public readonly aboveLimitValidationMessage = "Above the property coverage limit";

	get insuredAddress() {
		return this.formGroup.value.insuredAddress;
	}
	get isEditing(): boolean {
		return this._isEditing;
	}

	private _coverageLimits: PropertyLimit;
	private _isEditing: boolean;
	private _committedPropertyLimit = <PropertyLimit>{};
	private readonly _destroyed$ = new ReplaySubject(1);

	constructor(
		private readonly insuredAddressService: InsuredAddressService,
		private readonly propertyLimitsValidator: PropertyLimitsValidator,
		private readonly coverageService: CoverageService,
		private readonly quoteService: QuoteService
	) {
		this.formGroup = this.buildFormGroup();
	}

	ngOnInit(): void {
		this._coverageLimits = this.propertyLimitsValidator.getPropertyCoverageLimits();

		this.setValidatorToPropertyLimits();

		this.setDisablePropertyLimit();
	}

	setValidatorToPropertyLimits() {
		this.setControlValidators(this.formGroup.controls.grossRentalLimit, (control) => this.aboveLimitValidator(control, "grossRentalLimit"));
		this.setControlValidators(this.formGroup.controls.actualLossSustainedLimit, (control) => this.aboveLimitValidator(control, "actualLossSustainedLimit"));
		this.setControlValidators(this.formGroup.controls.propertyDamageLimit, [
			Validators.required,
			(control) => this.aboveLimitValidator(control, "propertyDamageLimit"),
		]);
		this.setControlValidators(this.formGroup.controls.contentsDamageLimit, [
			Validators.required,
			(control) => this.aboveLimitValidator(control, "contentsDamageLimit"),
		]);
		this.setControlValidators(this.formGroup.controls.stockDamageLimit, (control) => this.aboveLimitValidator(control, "stockDamageLimit"));
		this.setControlValidators(this.formGroup.controls.insuredAddress, Validators.required);
	}

	private setDisablePropertyLimit() {
		this._coverageLimits.isStockDamageLimitSelected === false
			? this.formGroup.controls.stockDamageLimit.disable()
			: this.formGroup.controls.stockDamageLimit.enable();

		this._coverageLimits.isPropertyDamageLimitSelected === false
			? this.formGroup.controls.propertyDamageLimit.disable()
			: this.formGroup.controls.propertyDamageLimit.enable();

		this._coverageLimits.isContentsDamageLimitSelected === false
			? this.formGroup.controls.contentsDamageLimit.disable()
			: this.formGroup.controls.contentsDamageLimit.enable();

		this._coverageLimits.isGrossRentalLimitSelected === false
			? this.formGroup.controls.grossRentalLimit.disable()
			: this.formGroup.controls.grossRentalLimit.enable();

		this._coverageLimits.isActualLossSustainedLimitSelected === false
			? this.formGroup.controls.actualLossSustainedLimit.disable()
			: this.formGroup.controls.actualLossSustainedLimit.enable();
	}

	ngOnDestroy(): void {
		this._destroyed$.next();
		this._destroyed$.complete();
	}

	onTouched: () => void = () => {};

	writeValue(propertyLimit: PropertyLimit): void {
		this.formGroup.patchValue(propertyLimit || new PropertyLimit());
		this.unselectInsuredAddress(this._committedPropertyLimit.insuredAddress?.clientLocationId);
		this.selectInsuredAddress(this.formGroup.value.insuredAddress?.clientLocationId);
		this._committedPropertyLimit = { ...this.formGroup.value };
	}

	registerOnChange(fn: (_: PropertyLimit) => void) {
		this.formGroup.valueChanges.pipe(takeUntil(this._destroyed$)).subscribe(fn);
	}

	registerOnTouched(fn: () => void) {
		this.onTouched = fn;
	}

	setDisabledState(disabled: boolean) {
		disabled ? this.formGroup.disable() : this.formGroup.enable();
	}

	public edit = (): void => {
		this.editing.emit(true);
	};

	public delete = (): void => {
		this.unselectInsuredAddress(this._committedPropertyLimit.insuredAddress?.clientLocationId);
		this.deleted.emit();
	};

	public cancel = (): void => {
		this.editing.emit(false);
	};

	public add = (): void => {
		if (this.formGroup.valid) {
			this.unselectInsuredAddress(this._committedPropertyLimit.insuredAddress?.clientLocationId);
			this.selectInsuredAddress(this.formGroup.value.insuredAddress?.clientLocationId);
			this._committedPropertyLimit = { ...this.formGroup.value };
			this.editing.emit(false);
		} else {
			markAllAsTouched(this.formGroup.controls);
		}
	};

	public onCountrySelected = (isoCode: string): void => {
		if (!!isoCode) {
			const isUKOrIreland = isoCode === "GB" || isoCode === "IE";
			const requiredValidator = isUKOrIreland ? Validators.required : null;

			this.setControlValidators(this.formGroup.controls.stockDamageLimit, requiredValidator);

			if (this.coverageService.isBICoverageSelected === true) {
				this.setControlValidators(this.formGroup.controls.actualLossSustainedLimit, requiredValidator);
				this.setControlValidators(this.formGroup.controls.grossRentalLimit, requiredValidator);
				isUKOrIreland
					? this.formGroup.controls.additionalIncreasedCostOfWorkingLimit.enable()
					: this.formGroup.controls.additionalIncreasedCostOfWorkingLimit.disable();
			}
			this.formGroup.updateValueAndValidity();
		}
	};

	public getCoverageLimitTooltip = (property) =>
		!!this._coverageLimits && !!this._coverageLimits[property]
			? `Total coverage limit of ${this.currency.symbol} ${this._coverageLimits[property]}`
			: "No coverage limit found";

	private setControlValidators = (control: AbstractControl, validator: ValidatorFn | ValidatorFn[]): void => {
		control.setValidators(validator);
		control.updateValueAndValidity();
	};

	private buildFormGroup = (): FormGroup => {
		return new FormGroup({
			actualLossSustainedLimit: new FormControl(),
			additionalIncreasedCostOfWorkingLimit: new FormControl({ value: null, disabled: true }, [Validators.required]),
			grossRentalLimit: new FormControl(),
			contentsDamageLimit: new FormControl(),
			insuredAddress: new FormControl(null, [Validators.required]),
			propertyDamageLimit: new FormControl(),
			stockDamageLimit: new FormControl(),
		});
	};

	hasRequired(control: AbstractControl): boolean {
		return control.validator && control.validator({} as AbstractControl) && control.validator({} as AbstractControl).required;
	}

	private aboveLimitValidator(control: AbstractControl, property: string): ValidationErrors | null {
		if (!!this._coverageLimits && !!this._coverageLimits[property]) {
			if (control.value && control.value > this._coverageLimits[property]) {
				return { aboveLimit: true };
			}
		}
		return null;
	}

	private selectInsuredAddress = (clientLocationId: number): void => {
		if (!!clientLocationId) {
			this.insuredAddressService.select(clientLocationId);
		}
	};

	private unselectInsuredAddress = (clientLocationId: number): void => {
		if (!!clientLocationId) {
			this.insuredAddressService.unselect(clientLocationId);
		}
	};
}
