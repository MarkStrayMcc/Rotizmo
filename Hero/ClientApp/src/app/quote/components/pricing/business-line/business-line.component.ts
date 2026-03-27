import { Component, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormArray, FormGroup, Validators } from "@angular/forms";
import { Constants } from "@app/constants/constants";
import { Currency, QuoteState, Document, FeatureAccess } from "@app/models";
import { UnderwriterDiscountAuthorityService } from "@app/services/UnderwriterValidation/underwriter-discount-authority.service";
import { PricingValidators } from "@app/validators/minimum-premium.validator";
import { forEach, isEqual } from "lodash";
import { distinctUntilChanged } from "rxjs/internal/operators/distinctUntilChanged";
import { ReplaySubject } from "rxjs/internal/ReplaySubject";
import { debounceTime, takeUntil, tap } from "rxjs/operators";
import { DiscountInformation } from "@app/quote/models/pricing/DiscountInformation";
import { RateChangeInformation } from "@app/quote/models/pricing/RateChangeInformation";
import { FiledDiscountInformation } from "@app/quote/models/pricing/FiledDiscountInformation";
import { PricingService } from "@app/quote/services/pricing-service";
import { UserService } from "@app/services/user.service";
import { SuggestedDiscountInformation } from "../../../models/pricing/SuggestedDiscountInformation";
import { Observable } from "rxjs";
import { FeaturesHttpService } from "@app/services/features-http.service";

@Component({
	selector: "business-line",
	templateUrl: "./business-line.component.html",
	styleUrls: ["./business-line.component.scss"],
})
export class BusinessLine implements OnInit, OnChanges {
	@Input() public form: FormGroup;
	@Input() public currency: Currency;
	@Input() public readonly: boolean = false;
	@Input() public quoteState: number = 1;
	@Input() public isNewQuote: boolean;
	@Input() public endorsements: Document[];
	@Input() public isAdmitted: boolean;

	@Output() public onWarning: EventEmitter<boolean> = new EventEmitter<boolean>();

	public maxDiscount: number = null;
	public maxDiscountWarning: string = "";
	public maxSuggestedDiscountPercentage: number = null;
	public maxSuggestedDiscountWarning: string = "";
	public isPremiumEditable: boolean = false;

	private hasSuggestedDiscountWarning: boolean = false;
	private hasMaxDiscountWarning: boolean = false;
	private readonly _destroyed$ = new ReplaySubject<void>(1);
	public isRateChangePercentageRequired: boolean = false;
	public isFiledPremiumAndDiscountAvailable: boolean = false;
	public isFiledDiscountRequired: boolean = false;
	public isSuggestedDiscountPercentageRequired: boolean = true;
	private triggerFiledDiscountChange: boolean = true;
	private triggerRateChangePercentageChange: boolean = true;
	private triggerSuggestedDiscountPercentage: boolean = true;

    private readonly isMultiplePropertiesClauseForFrenchTerritoriesFeature$ : Observable<FeatureAccess | any>= this.featureService.isFeatureActive("HERO_MultiplePropertiesClauseForFrenchTerritories");
	private isMultiplePropertiesClauseForFrenchTerritoriesFeature : FeatureAccess;

	constructor(
		private underwriterDiscountService: UnderwriterDiscountAuthorityService,
		private readonly pricingService: PricingService,
		private readonly userService: UserService,
		private readonly featureService: FeaturesHttpService,
	) {}

	public ngOnInit(): void {
		if (this.form) {
			this.setFormValidators();
			this.setRateChangeAvailability();
			this.setFiledPremiumAvailability();
			this.isSuggestedDiscountPercentageRequired = !!this.form.controls.suggested.value;

			if (!this.readonly) {
				this.initialise();
			}

			if (this.isRateChangePercentageRequired) {
				this.watchRateChangePercentageChange();
				this.setRateChangePercentageValidators();
			}

			if (this.isFiledDiscountRequired) {
				this.watchFiledDiscountChange();
				this.setFiledDiscountValidators();
			}

			if (this.isSuggestedDiscountPercentageRequired) {
				this.form.controls.suggestedDiscountPercentage.setValidators([Validators.required, Validators.max(100)]);
				this.form.controls.suggestedDiscountPercentage.updateValueAndValidity();
				this.watchSuggestedDiscountPercentageChange();
			}
		}
	}

	private setFormValidators() {
		const minimumValue = this.form.controls.minimumPremium.value;

		this.form.controls.model.setValidators(Validators.required);
		this.form.controls.suggested.setValidators(Validators.required);
		this.form.controls.quoted.setValidators([Validators.required, PricingValidators.minimumPremium(minimumValue)]);
		this.form.controls.discount.setValidators([Validators.required, Validators.max(100)]);
	}

	private setRateChangeAvailability() {
		this.isRateChangePercentageRequired = this.canCalculateRateChange();
	}

	private setRateChangePercentageValidators = (): void => {
		if (this.isRateChangePercentageRequired) {
			this.form.controls.rateChangePercentage.setValidators([Validators.required]);
			this.form.controls.rateChangePercentage.updateValueAndValidity();
		}
	};

	private canCalculateRateChange = () =>
		!(
			!this.form.controls.currentRateChangePremium.value ||
			!this.form.controls.expiringRateChangePremium.value ||
			!this.form.controls.expiringQuotedPremium.value
		);

	private setFiledPremiumAvailability() {
		this.isFiledPremiumAndDiscountAvailable = this.canCalculateFiledDiscount();
		this.isFiledDiscountRequired = this.isFiledPremiumAndDiscountAvailable && !!this.form.controls.filedPremium.value;
	}

	private setFiledDiscountValidators = (): void => {
		if (this.isFiledDiscountRequired) {
			this.form.controls.filedDiscount.setValidators([Validators.required]);
			this.form.controls.filedDiscount.updateValueAndValidity();
		}
	};

	private canCalculateFiledDiscount = () => this.isAdmitted && this.userService.isFeatureAccessible("heroFiledPremiumAndDiscount");

	private initialise() {
		this.initaliseIsPremiumEditable();

		this.initaliseDiscount();
		this.initaliseRateChangePercentage();
		this.initaliseFiledDiscount();
		this.initaliseSuggestedDiscountPercentage();

		this.form.updateValueAndValidity();

		this.isMultiplePropertiesClauseForFrenchTerritoriesFeature$.pipe(takeUntil(this._destroyed$), tap((feature: FeatureAccess | any) => this.isMultiplePropertiesClauseForFrenchTerritoriesFeature = feature)).subscribe();
	}

	private initaliseIsPremiumEditable = (): void => {
		const isPropertyBusinessLine = this.form.controls.businessLine.value.name === "MD";
		const isMultipleProperties = this.endorsements.some((endorsement) => {
			return Constants.getMultiplePropertyEndorsementReferences(this.isMultiplePropertiesClauseForFrenchTerritoriesFeature?.hasAccess).includes(endorsement.reference);
		});

		this.isPremiumEditable = isPropertyBusinessLine && isMultipleProperties;
		this.isSuggestedDiscountPercentageRequired = this.isSuggestedDiscountPercentageRequired || this.isPremiumEditable;
	};

	private initaliseDiscount = (): void => {
		const discountInformation = this.getDiscountInformation();
		if (this.form.controls.suggestedDiscount.value === 0 && !this.isNewQuote) {
			const discount = this.pricingService.calculateDiscountFromQuotedPremium(discountInformation);
			this.form.controls.discount.setValue(discount);
		} else {
			this.updateQuotedPremiumFromDiscount();
		}
	};

	private initaliseRateChangePercentage = (): void => {
		this.updateRateChangePercentage();
	};

	private initaliseFiledDiscount = (): void => {
		this.updateFiledDiscount();
	};

	private initaliseSuggestedDiscountPercentage = (): void => {
		this.updateSuggestedDiscountPercentage();
	};

	ngOnDestroy(): void {
		this._destroyed$.next();
		this._destroyed$.complete();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		if (changes) {
			if (this.maxDiscount == null) {
				this.maxDiscount = this.underwriterDiscountService.getMaxDiscountPercentage();
				this.maxDiscountWarning = "Maximum discount allowed is " + this.maxDiscount + "%";
			}
			if (this.maxSuggestedDiscountPercentage == null) {
				this.maxSuggestedDiscountPercentage = this.underwriterDiscountService.getMaxSuggestedDiscountPercentage();
				this.maxSuggestedDiscountWarning = "Maximum suggested discount allowed is " + this.maxSuggestedDiscountPercentage + "%";
			}
		}
	}

	public toggleExpansion() {
		const isExpanded = this.form.controls.isExpanded.value;
		this.form.controls.isExpanded.setValue(!isExpanded);
	}

	public hasWarning(): boolean {
		this.hasMaxDiscountWarning = this.form.controls.discount.value > this.maxDiscount && this.quoteState < QuoteState.Approved;

		this.emitWarning();
		return this.hasMaxDiscountWarning;
	}

	public suggestedDiscountWarning(): boolean {
		this.hasSuggestedDiscountWarning =
			this.form.controls.suggestedDiscountPercentage.value > this.maxSuggestedDiscountPercentage && this.quoteState < QuoteState.Approved;

		this.emitWarning();
		return this.hasSuggestedDiscountWarning;
	}

	emitWarning() {
		let hasWarning = this.hasMaxDiscountWarning === true || this.hasSuggestedDiscountWarning === true;
		this.onWarning.emit(hasWarning);
	}

	public name(): string {
		return `${this.form.controls.binder.value.binderDescription} - ${this.form.controls.businessLine.value.description}`;
	}

	// changed fields values
	public quotedChanged(value?: boolean): void {
		if (!value) {
			this.updateDiscount();
			this.updateRateChangePercentage();
			this.updateFiledDiscount();
			this.updateSuggestedDiscountPercentage();

			this.updateHiddenSuggestedDiscount();
		}
	}

	public discountChanged(value?: boolean): void {
		if (!value) {
			this.updateQuotedPremiumFromDiscount();
			this.updateRateChangePercentage();
			this.updateFiledDiscount();
			this.updateSuggestedDiscountPercentage();
		}
	}

	private rateChangePercentageChanged(): void {
		if (!this.isRateChangePercentageRequired) {
			return;
		}
		this.updateQuotedPremiumFromRateChangePercentage();
		this.updateDiscount();
		this.updateFiledDiscount();
		this.updateSuggestedDiscountPercentage();
	}

	private filedDiscountChanged(): void {
		if (!this.isFiledDiscountRequired) {
			return;
		}

		this.updateQuotedPremiumFromFiledDiscount();
		this.updateDiscount();
		this.updateRateChangePercentage();
		this.updateSuggestedDiscountPercentage();
	}

	private suggestedDiscountPercentageChanged(): void {
		this.updateQuotedPremiumFromSuggestedDiscountPercentage();
		this.updateDiscount();
		this.updateRateChangePercentage();
		this.updateFiledDiscount();
	}

	//-- upadate quoted premium when other fields changes

	private updateQuotedPremiumFromDiscount(): void {
		let discountInformation = this.getDiscountInformation();

		let recalculatedDiscount = this.pricingService.calculateDiscountFromQuotedPremium(discountInformation);
		if (recalculatedDiscount !== discountInformation.discount) {
			const updatedQuotedPremium = this.pricingService.calculateQuotedPremiumFromDiscount(discountInformation);
			this.form.controls.quoted.setValue(updatedQuotedPremium);
			this.updateHiddenSuggestedDiscount();
		}
	}

	private updateQuotedPremiumFromFiledDiscount() {
		if (!this.isFiledDiscountRequired) {
			return;
		}

		let filedDiscountInformation = this.getFiledDiscountInformation();

		let recalculatedFiledDiscount = this.pricingService.calculateFiledDiscountFromQuotedPremium(filedDiscountInformation);
		if (recalculatedFiledDiscount !== filedDiscountInformation.filedDiscount) {
			const updateQuotedPremium = this.pricingService.calculateQuotedPremiumFromFiledDiscount(filedDiscountInformation);
			this.form.controls.quoted.setValue(updateQuotedPremium);
			this.updateHiddenSuggestedDiscount();
		}
	}

	private updateQuotedPremiumFromRateChangePercentage(): void {
		let rateChangeInformation = this.getRateChangeInformation();

		let recalculatedRateChangePercentage = this.pricingService.calculateRateChangePercentageFromQuotedPremium(rateChangeInformation);
		if (recalculatedRateChangePercentage !== rateChangeInformation.rateChangePercentage) {
			const updatedQuotedPremium = this.pricingService.calculateQuotedPremiumFromRateChangePercentage(rateChangeInformation);
			this.form.controls.quoted.setValue(updatedQuotedPremium);
			this.updateHiddenSuggestedDiscount();
		}
	}

	private updateQuotedPremiumFromSuggestedDiscountPercentage() {
		let suggestedDiscountPercentageInformation = this.getSuggestedDiscountInformation();

		let recalculatedSuggestedDiscountPercentage =
			this.pricingService.calculateSuggestedDiscountPercentageFromQuotedPremium(suggestedDiscountPercentageInformation);
		if (recalculatedSuggestedDiscountPercentage !== suggestedDiscountPercentageInformation.suggestedDiscountPercentage) {
			const updateQuotedPremium = this.pricingService.calculateQuotedPremiumFromSuggestedDiscountPercentage(suggestedDiscountPercentageInformation);
			this.form.controls.quoted.setValue(updateQuotedPremium);
			this.updateHiddenSuggestedDiscount();
		}
	}

	// -- update discount and percentages
	private updateDiscount(): void {
		let discountInformation = this.getDiscountInformation();

		let recalculatedQuotedPremium = this.pricingService.calculateQuotedPremiumFromDiscount(discountInformation);
		if (recalculatedQuotedPremium !== discountInformation.quotedPremium) {
			const updatedDiscount = this.pricingService.calculateDiscountFromQuotedPremium(discountInformation,true);
			this.form.controls.discount.setValue(updatedDiscount);
		}
	}

	private updateHiddenSuggestedDiscount() {
		const suggested = this.form.controls.suggested.value;
		const quotedPremium = this.form.controls.quoted.value;

		const suggestedQuoted = suggested - quotedPremium;
		this.form.controls.suggestedDiscount.setValue(suggestedQuoted);
	}

	private updateFiledDiscount(this): void {
		if (!this.isFiledDiscountRequired) {
			return;
		}

		let filedDiscountInformation = this.getFiledDiscountInformation();

		let recalculatedQuotedPremium = this.pricingService.calculateQuotedPremiumFromFiledDiscount(filedDiscountInformation);
		if (recalculatedQuotedPremium !== filedDiscountInformation.quotedPremium) {
			const updatedFiledDiscount = this.pricingService.calculateFiledDiscountFromQuotedPremium(filedDiscountInformation);
			this.triggerFiledDiscountChange = false;
			this.form.controls.filedDiscount.setValue(updatedFiledDiscount);
			this.form.controls.filedDiscount.updateValueAndValidity();
		}
	}

	private updateRateChangePercentage(this): void {
		if (!this.isRateChangePercentageRequired) {
			return;
		}

		let rateChangeInformation = this.getRateChangeInformation();
		let recalculatedQuotedPremium = this.pricingService.calculateQuotedPremiumFromRateChangePercentage(rateChangeInformation);

		if (recalculatedQuotedPremium !== rateChangeInformation.quotedPremium) {
			const updateRateChangePercentage = this.pricingService.calculateRateChangePercentageFromQuotedPremium(rateChangeInformation);
			this.triggerRateChangePercentageChange = false;
			this.form.controls.rateChangePercentage.setValue(updateRateChangePercentage);
			this.form.controls.rateChangePercentage.updateValueAndValidity();
		}
	}

	private updateSuggestedDiscountPercentage(this): void {
		if (!this.isSuggestedDiscountPercentageRequired) {
			return;
		}

		let suggestedDiscountPercentageInformation = this.getSuggestedDiscountInformation();

		let recalculatedQuotedPremium = this.pricingService.calculateQuotedPremiumFromSuggestedDiscountPercentage(suggestedDiscountPercentageInformation);
		if (recalculatedQuotedPremium !== suggestedDiscountPercentageInformation.quotedPremium) {
			const updatedSuggestedDiscountPercentage =
				this.pricingService.calculateSuggestedDiscountPercentageFromQuotedPremium(suggestedDiscountPercentageInformation);
			this.triggerSuggestedDiscountPercentage = false;
			this.form.controls.suggestedDiscountPercentage.setValue(updatedSuggestedDiscountPercentage);
			this.form.controls.suggestedDiscountPercentage.updateValueAndValidity();
		}
	}

	//set watchers when fields changes values

	private watchRateChangePercentageChange = () => {
		this.form.controls.rateChangePercentage.valueChanges
			.pipe(
				takeUntil(this._destroyed$),
				debounceTime(250),
				distinctUntilChanged(isEqual),
				tap(() => {
					if (this.triggerRateChangePercentageChange) {
						this.rateChangePercentageChanged();
					}
					this.triggerRateChangePercentageChange = true;
				})
			)
			.subscribe();
	};

	private watchFiledDiscountChange = () => {
		this.form.controls.filedDiscount.valueChanges
			.pipe(
				takeUntil(this._destroyed$),
				debounceTime(250),
				distinctUntilChanged(isEqual),
				tap(() => {
					if (this.triggerFiledDiscountChange) {
						this.filedDiscountChanged();
					}
					this.triggerFiledDiscountChange = true;
				})
			)
			.subscribe();
	};

	private watchSuggestedDiscountPercentageChange = () => {
		this.form.controls.suggestedDiscountPercentage.valueChanges
			.pipe(
				takeUntil(this._destroyed$),
				debounceTime(250),
				distinctUntilChanged(isEqual),
				tap(() => {
					if (this.triggerSuggestedDiscountPercentage) {
						this.suggestedDiscountPercentageChanged();
					}
					this.triggerSuggestedDiscountPercentage = true;
				})
			)
			.subscribe();

		if (this.isPremiumEditable) {
			this.form.controls.suggested.valueChanges
				.pipe(
					takeUntil(this._destroyed$),
					debounceTime(250),
					distinctUntilChanged(isEqual),
					tap(() => {
						this.suggestedDiscountPercentageChanged();
						this.form.controls.suggested.updateValueAndValidity();
					})
				)
				.subscribe();
		}
	};

	//get fields information

	private getFiledDiscountInformation(): FiledDiscountInformation {
		const filedDiscountInformation = {
			filedPremium: this.form.controls.filedPremium.value,
			filedDiscount: this.form.controls.filedDiscount.value,
			quotedPremium: this.form.controls.quoted.value,
		} as FiledDiscountInformation;

		return filedDiscountInformation;
	}

	private getDiscountInformation(): DiscountInformation {
		const discountInformation = {
			model: this.form.controls.model.value,
			discount: this.form.controls.discount.value,
			quotedPremium: this.form.controls.quoted.value,
            businessLine: this.form.controls.businessLine.value,
		} as DiscountInformation;

		return discountInformation;
	}

	private getRateChangeInformation(): RateChangeInformation {
		const rateChangeInformation = {
			quotedPremium: this.form.controls.quoted.value,
			currentRateChangePremium: this.form.controls.currentRateChangePremium.value,
			expiringQuotedPremium: this.form.controls.expiringQuotedPremium.value,
			expiringRateChangePremium: this.form.controls.expiringRateChangePremium.value,
			rateChangePercentage: this.form.controls.rateChangePercentage.value,
		} as RateChangeInformation;

		return rateChangeInformation;
	}

	private getSuggestedDiscountInformation(): SuggestedDiscountInformation {
		const suggestedDiscountInformation = {
			quotedPremium: this.form.controls.quoted.value,
			suggestedDiscountPercentage: this.form.controls.suggestedDiscountPercentage.value,
			suggested: this.form.controls.suggested.value,
		} as SuggestedDiscountInformation;

		return suggestedDiscountInformation;
	}
}
