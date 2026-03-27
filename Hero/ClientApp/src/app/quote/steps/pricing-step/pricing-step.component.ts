import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Constants } from "@app/constants/constants";
import { MessageCategory } from "@app/enums/MessageCategory";
import { MessageType } from "@app/enums/MessageType";
import { IsDirty } from "@app/interfaces/IsDirty";
import { IsLoaded } from "@app/interfaces/IsLoaded";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import { FeatureAccess, PricingInformation, Quote, QuoteFeeRequest, Tag } from "@app/models";
import { ModelMappingsHelper } from "@app/models/Mappings/ModelMappingsHelper";
import { Message } from "@app/models/Message";
import { CommissionInformation } from "@app/quote/models/pricing/CommissionInformation";
import { QuoteService } from "@app/quote/services/quote.service";
import { BaseStepComponent } from "@app/quote/steps/base-step.component";
import { FeeHttpService } from "@app/services/fee-http.service";
import { MessageService } from "@app/services/message.service";
import { PremiumCalculationsService } from "@app/quote/services/premium-calculations.service";
import { PricingService } from "@app/quote/services/pricing-service";
import { UserService } from "@app/services/user.service";
import { MaximumFeeAsyncValidator } from "@app/validators/maximum-fee-async.validator";
import { cloneDeep, has, isEqual } from "lodash";
import { Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, first, map, takeUntil, tap } from "rxjs/operators";
import { FeaturesHttpService } from "@app/services/features-http.service";

@Component({
	selector: "pricing-step",
	styleUrls: ["./pricing-step.component.scss"],
	templateUrl: "./pricing-step.component.html",
})
export class PricingStepComponent extends BaseStepComponent implements OnInit, AfterViewInit, OnDestroy, IsValid, IsDirty, IsLoaded, MarkAsTouched, OnChanges {
	@Input()
	public isFirstLoad: boolean;

	@Output()
	public onFirstLoadChanged = new EventEmitter<boolean>();

	@Output()
	public onActualGrossCommissionChange = new EventEmitter<boolean>();

	public isNewQuote: boolean = false;

	public commissionForm: FormGroup;
	public pricingInformationForm: FormArray;
	public businessLineWarnings: { [key: string]: boolean } = {};

	private isFeeNeedsSplitRecalculation: boolean = false;
	private feeCalculationError$: Subject<string>;

    private readonly isMultiplePropertiesClauseForFrenchTerritoriesFeature$ : Observable<FeatureAccess | any>= this.featureService.isFeatureActive("HERO_MultiplePropertiesClauseForFrenchTerritories");
	private isMultiplePropertiesClauseForFrenchTerritoriesFeature : FeatureAccess;

	constructor(
		private readonly formBuilder: FormBuilder,
		private readonly pricingService: PricingService,
		private readonly premiumCalculationService: PremiumCalculationsService,
		private readonly feeHttpService: FeeHttpService,
		private readonly userService: UserService,
		private readonly featureService: FeaturesHttpService,
		private readonly messageService: MessageService,
		private readonly maximumFeeAsyncValidator: MaximumFeeAsyncValidator,
		private readonly quoteService: QuoteService,
	) {
		super();
	}

	public ngOnInit(): void {
		this.initialiseCommissionInformationForm();
		this.initialisePricingInformationForm();
		this.isMultiplePropertiesClauseForFrenchTerritoriesFeature$.pipe(takeUntil(this.destroyed$), tap((feature: FeatureAccess | any) => this.isMultiplePropertiesClauseForFrenchTerritoriesFeature = feature)).subscribe();

		this.stepForm = this.formBuilder.group({
			commission: this.commissionForm,
			pricingInformation: this.pricingInformationForm,
		});
		this.setChange();

		this.feeCalculationError$ = this.getFeeCalculationError$();
		this.watchFeeCalculationErrorMessage();
	}

	private updateCommissionFormValues(commissionInformation$: Observable<CommissionInformation>): void {
		commissionInformation$
			.pipe(
				takeUntil(this.destroyed$),
				tap((commissionInformation) => {
					if (!isEqual(this.commissionForm.value, commissionInformation)) {
						this.commissionForm.patchValue(commissionInformation);
					}
				})
			)
			.subscribe();
	}

	private watchQuoteCommissionInformationChange$ = () =>
		this.quoteService.propertyChanged$.pipe(
			distinctUntilChanged(),
			filter((propertyChanged) => propertyChanged.type === "commissionInformation"),
			map((propertyChanged) => propertyChanged.payload)
		);

	public ngOnChanges(changes: SimpleChanges): void {
		if (changes && changes.vm && this.commissionForm) {
			// update max fee based on updated vm
			this.setValidatorsForFee();
		}
	}

	public ngAfterViewInit(): void {
		const commissionInformation$ = this.watchQuoteCommissionInformationChange$();
		this.updateCommissionFormValues(commissionInformation$);

        this.watchPricingInformationFormChanges();

		this.commissionForm.controls.fee.valueChanges
			.pipe(
				distinctUntilChanged(),
				takeUntil(this.destroyed$),
				debounceTime(500),
				tap((commission) => {
					this.isFeeNeedsSplitRecalculation = true;
				})
			)
			.subscribe();
		// WHEN WE CHANGE THE vm.needsPricingRecalculation is set to false and don't enable the recalculate button
		this.commissionForm.valueChanges
			.pipe(
				distinctUntilChanged(isEqual),
				takeUntil(this.destroyed$),
				debounceTime(500),
				tap((_) => {
					this.processCommissionInformationChanges();

					if (this.isFeeNeedsSplitRecalculation) {
						this.premiumCalculationService.calculateFeeSplit(this.vm);
						this.isFeeNeedsSplitRecalculation = false;
					}
				})
			)
			.subscribe();

		this.commissionForm
			.get("actualGrossCommission")
			.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$))
			.subscribe((val) => {
				this.monitorActualGrossCommissionChanges();
			});
	}

	public isValid(): boolean {
		if (!this.stepForm.valid && this.pricingInformationForm.valid && this.commissionForm.valid) {
			this.stepForm.updateValueAndValidity();
		}

		return this.isLoaded && this.stepForm && this.stepForm.valid && this.vm.pricingInformation && this.vm.pricingInformation.length > 0;
	}

	public isDirty(): boolean {
		return this.stepForm.dirty;
	}

	public isLoaded(): boolean {
		return this.loaded;
	}

	public markAsTouched(): void {
		this.stepForm.markAsTouched();
	}

	public handleWarnings(businessLine: FormGroup, isWarning: boolean) {
		if (businessLine && businessLine.controls.businessLine) {
			const key = businessLine.controls.businessLine.value.name;
			this.businessLineWarnings[key] = isWarning;
		}

		let actualWarning = false;
		for (const key of Object.keys(this.businessLineWarnings)) {
			actualWarning = this.businessLineWarnings[key] || actualWarning;
		}

		this.setWarning(actualWarning);
	}

	public setValidatorsForFee() {
		if (!this.userService.isFeatureAccessible("excelFeeCalculation")) {
			const request = ModelMappingsHelper.getQuoteFeeRequest(this.vm);

			this.getMaxFee(request).subscribe(
				(maxFee) => {
					this.commissionForm.controls.fee.setValidators([Validators.required, Validators.max(maxFee)]);
				},
				(error) => {
					console.error("Error retrieving the Max Fee information", error);
				}
			);
		}
	}

	private initialiseCommissionInformationForm(): void {
		if (this.vm.quoteReference === 0 && this.isFirstLoad) {
			this.onFirstLoadChanged.emit(true);
		}

		this.buildCommissionForm();
		this.setValidatorsForFee();
	}

	private buildCommissionForm(): void {
		const feeValidator = this.userService.isFeatureAccessible("excelFeeCalculation") ? [this.maximumFeeAsyncValidator] : [];

		this.commissionForm = this.formBuilder.group({
			commissionRebate: [""],
			originalGrossCommission: [this.vm.commissionInformation.originalGrossCommission, [Validators.required]],
			actualGrossCommission: [this.vm.commissionInformation.actualGrossCommission, [Validators.required]],
			cfcShare: [this.vm.commissionInformation.cfcShare, [Validators.required]],
			fee: [this.vm.commissionInformation.fee, [Validators.required], feeValidator],
            brokerFee: [this.vm.commissionInformation.brokerFee],
		});
	}

	private monitorActualGrossCommissionChanges(): void {
		if (this.commissionForm.controls.actualGrossCommission.dirty) {
			this.buttonStatus = {
				canSaveAfterRecalculate: true,
				allowRecalculate: true,
			};
			this.quoteService.setPropertyValue("actualGrossCommission", this.commissionForm.controls.actualGrossCommission.value);
			this.quoteService.setPropertyValue("needsPricingRecalculation", true);
			this.onActualGrossCommissionChange.emit(true);
		}
	}

	private getMaxFee(request: QuoteFeeRequest): Observable<number> {
		return this.feeHttpService.getMaximumFee(request);
	}

	private initialisePricingInformationForm(): void {
		this.updatePricingInformationFormOnChanges();
		if (!this.vm.pricingInformation || this.vm.pricingInformation.length === 0 || this.vm.needsPricingRecalculation) {
			this.pricingInformationForm = this.formBuilder.array([]);
			this.pricingService
				.getPricingInformation(this.vm)
				.pipe(first())
				.subscribe(
					(result) => {
						const hasLocationOutputs = !!result.locationOutputs && result.locationOutputs.length > 0;
						result.pricingInformations.forEach((pricingInformation) => {
							const isMultipleProperties = this.isMultipleProperties(pricingInformation.businessLine);

							if (isMultipleProperties && !hasLocationOutputs) {
								this.removeMultiplePropertyPricingInformation(pricingInformation);
							}

							if (this.isNewQuote) {
								const pricinginformationForBusinessLine = this.getPricingInformationForBusinessLine(pricingInformation.businessLine.name);
								pricingInformation.discount = pricinginformationForBusinessLine.discount;
								pricingInformation.rateChangePercentage = pricinginformationForBusinessLine.rateChangePercentage;
								pricingInformation.filedDiscount = pricinginformationForBusinessLine.filedDiscount;
								pricingInformation.suggestedDiscountPercentage = pricinginformationForBusinessLine.suggestedDiscountPercentage;
							}

							this.pricingInformationForm.push(this.formBuilder.group(pricingInformation));
							this.pricingInformationForm.updateValueAndValidity();
						});

						if (hasLocationOutputs){
							this.quoteService.mapLocationPremiumsToPropertyLimits(result.locationOutputs);
						}
					},
					(error) => console.error("Error updating price information", error),
					() => {
						this.loaded = true;
						this.vm.needsPricingRecalculation = false;
					}
				);
		} else {
			this.pricingInformationForm = new FormArray(this.vm.pricingInformation.map((x) => this.formBuilder.group(x)));
			this.loaded = true;
		}
	}

	private isMultipleProperties = (businessLine: Tag): boolean => {
		const isPropertyBusinessLine = businessLine.name === "MD";
		const isMultipleProperties = this.vm.endorsements.some((endorsement) => {
			return Constants.getMultiplePropertyEndorsementReferences(this.isMultiplePropertiesClauseForFrenchTerritoriesFeature?.hasAccess).includes(endorsement.reference);
		});

		return isPropertyBusinessLine && isMultipleProperties;
	};

	private removeMultiplePropertyPricingInformation = (pricingInformation: PricingInformation): void => {
		let overriddenPricingInformation = null;

		if (!!this.vm.pricingInformation && this.vm.pricingInformation.length > 0) {
			overriddenPricingInformation = this.vm.pricingInformation.find((pi) => pi.businessLine.name === "MD");
		}

		pricingInformation.model = overriddenPricingInformation?.model;
		pricingInformation.suggested = overriddenPricingInformation?.suggested;
		pricingInformation.quoted = overriddenPricingInformation?.quoted;
	};

	private updatePricingInformationFormOnChanges() {
		this.pricingService.pricingInformationChanges.pipe(takeUntil(this.destroyed$)).subscribe((changes) => {
			if (this.stepForm) {
				this.pricingInformationForm = new FormArray(this.vm.pricingInformation.map((x) => this.formBuilder.group(x)));
				this.stepForm.controls.pricingInformation = this.pricingInformationForm;
                this.watchPricingInformationFormChanges();
			}
		});
	}

	private getPricingInformationForBusinessLine(businessLineName: string) {
		return this.originalQuote.pricingInformation.find((pricing) => pricing.businessLine.name === businessLineName);
	}

	private processBusinessLineChanges(): void {
		if (!this.readonly) {
			this.quoteService.setPropertyValue("pricingInformation", this.pricingInformationForm.value);
			this.premiumCalculationService
				.calculateTotalFee(this.vm)
				.pipe(first())
				.subscribe(
					(quoteResult) => {
						this.quoteService.setPropertyValue("commissionInformation", (quoteResult as Quote).commissionInformation);
						this.premiumCalculationService.updatePremium();
					},
					(error) => {
						console.error("Error calculating the Total Fee information", error);
					}
				);
		}
	}

	private getFeeCalculationError$(): Subject<string> {
		return this.premiumCalculationService.feeCalculationError;
	}

	private watchFeeCalculationErrorMessage() {
		this.feeCalculationError$
			.pipe(
				takeUntil(this.destroyed$),
				tap((errorMessage) => {
					if (errorMessage !== "Max fee has been applied" && errorMessage !== "Min fee has been applied") {
						this.messageService.clearMessage();
						this.messageService.clearMessage(MessageCategory.ExcelFeeCalculator);

						const msg = new Message();
						msg.type = MessageType.Error;
						msg.text = errorMessage;

						this.messageService.sendMessage(msg);
						this.messageService.sendMessage(msg, MessageCategory.ExcelFeeCalculator);
					}
				})
			)
			.subscribe();
	}

	private processCommissionInformationChanges() {
		if (!this.readonly) {
			this.quoteService.setPropertyValue("commissionInformation", { ...this.commissionForm.value });
			this.premiumCalculationService.updatePremium();
		}
	}

    private watchPricingInformationFormChanges = () =>
            this.pricingInformationForm.valueChanges
            .pipe(
                distinctUntilChanged(),
                takeUntil(this.destroyed$),
                debounceTime(500),
                tap((_) => {
                    this.stepForm.setErrors({ invalid: true });
                    this.processBusinessLineChanges();
                })
            )
            .subscribe();
}
