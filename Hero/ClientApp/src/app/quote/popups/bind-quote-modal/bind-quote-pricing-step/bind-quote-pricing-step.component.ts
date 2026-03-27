import { TransactionService } from "./../../../services/transaction.service";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnDestroy, OnInit } from "@angular/core";
import {
	ControlValueAccessor,
	FormArray,
	FormControl,
	FormGroup,
	NG_VALIDATORS,
	NG_VALUE_ACCESSOR,
	ValidationErrors,
	Validator,
	Validators,
} from "@angular/forms";
import { Quote } from "@app/models";
import { PricingInformation } from "@app/quote/models/pricing/PricingInformation";
import { QuoteService } from "@app/quote/services/quote.service";
import { UserService } from "@app/services/user.service";
import { isEqual } from "lodash";
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject } from "rxjs";
import { distinctUntilChanged, map, shareReplay, switchMap, takeUntil, tap } from "rxjs/operators";
import { ContactDetails } from "./contact-details.model";
import { DirectBillingService } from "./direct-billing.service";
import { PaymentService } from "./payment.service";
import { PaymentPeriod } from "@app/enums/PaymentPeriod";

import { Limit } from "./limit.model";

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: "bind-quote-pricing-step",
	styleUrls: ["./bind-quote-pricing-step.component.scss"],
	templateUrl: "./bind-quote-pricing-step.component.html",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			multi: true,
			useExisting: forwardRef(() => BindQuotePricingStepComponent),
		},
		{
			provide: NG_VALIDATORS,
			multi: true,
			useExisting: forwardRef(() => BindQuotePricingStepComponent),
		},
	],
})
export class BindQuotePricingStepComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
	@Input() isCalculating: boolean;

	public readonly formGroup = this.buildFormGroup();

	public paymentLimit$: Observable<Limit>;
	public totalPremium$: Observable<number>;
	public isDirectBillingVisible$: Observable<boolean>;
	public isDirectBillingEnabled$: Observable<boolean>;
	public isMaxLimitExceeded$: Observable<boolean>;
	public contactDetails$: Observable<ContactDetails | null>;
	public isPaymentPeriodVisible$: Observable<boolean>;
	public paymentPeriods = PaymentPeriod;
	public readonly paymentPeriodToggle: string = "MonthlyAgencyBilling";


	public get businessCategoriesFormArray() {
		return this.formGroup.controls.businessCategories as FormArray;
	}
	public get contactFormGroup() {
		return this.formGroup.controls.contact as FormGroup;
	}

	public get isDirectBillingControl() {
		return this.formGroup.controls.isDirectBilling;
	}

	public get isPaymentPeriodControl() {
		return this.formGroup.controls.paymentPeriod;
	}

	private readonly _destroyed$ = new ReplaySubject<void>(1);

	constructor(
		private readonly directBillingService: DirectBillingService,
		private readonly quoteService: QuoteService,
		private readonly userService: UserService,
		private readonly transactionService: TransactionService,
		private readonly paymentService: PaymentService
	) {}

	ngOnInit(): void {
		this.paymentLimit$ = this.getPaymentLimit$();
		this.totalPremium$ = this.getTotalPremium$();
		this.isDirectBillingVisible$ = this.getIsDirectBillingVisible$();
		this.contactDetails$ = this.getContactDetails$();
		this.isMaxLimitExceeded$ = this.getIsMaxLimitExceeded$();
		this.isDirectBillingEnabled$ = this.directBillingService.getIsDirectBillingEnabled();
		this.isPaymentPeriodVisible$ = this.getIsPaymentPeriodVisible();

		this.watchTotalPremiumChange();
		this.watchIsDirectBillingSelected();
		this.watchPricingInformationChange();
		this.watchExpiringPolicyTypeOfBilling();
		this.watchContactDetailsChange();
		this.watchPaymentPeriodDetailsChange();
	}

	ngOnDestroy(): void {
		this._destroyed$.next();
		this._destroyed$.complete();
	}

	writeValue = (): void => {};

	registerOnChange(fn: (_: any) => void): void {
		this.formGroup.valueChanges.pipe(takeUntil(this._destroyed$)).subscribe(fn);
	}

	registerOnTouched(): void {}

	validate(): ValidationErrors {
		return this.formGroup.invalid ? { invalid: true } : null;
	}

	private buildFormGroup(): FormGroup {
		return new FormGroup({
			businessCategories: new FormArray([]),
			isDirectBilling: new FormControl({ value: false, disabled: true }),
			contact: this.buildContactFormGroup(),
			paymentPeriod: new FormControl(PaymentPeriod.Annual)
		});
	}

	private buildContactFormGroup(): FormGroup {
		const contact = new FormGroup({
			firstName: new FormControl(null, [Validators.required]),
			lastName: new FormControl(null, [Validators.required]),
			email: new FormControl(null, [Validators.required]),
		});

		contact.disable();

		return contact;
	}

	private buildBusinessCategoryFormGroups = (pricingInformation: PricingInformation[]): void => {
		this.businessCategoriesFormArray.clear();

		for (const pi of pricingInformation) {
			this.businessCategoriesFormArray.push(
				new FormGroup({
					tagName: new FormControl(pi.businessLine.name),
					description: new FormControl(pi.businessLine.description),
					model: new FormControl(pi.model),
					quoted: new FormControl(pi.quoted, [Validators.required]),
				})
			);
		}
	};

	private getTotalPremium$ = (): Observable<number> => {
		return this.businessCategoriesFormArray.valueChanges.pipe(distinctUntilChanged(isEqual), map(this.getTotalPremium), shareReplay(1));
	};

	private getPaymentLimit$ = (): Observable<Limit> => {
		const isFeatureAccessible = this.userService.isFeatureAccessible("heroDirectBilling");
		const productName$ = this.getQuotePropertyObservable((quote) => quote.product.productName);
		const countryIsoCode$ = this.getQuotePropertyObservable((quote) => quote.client.primaryLocation.country.isoCode);
		const getPaymentLimit$ = countryIsoCode$.pipe(switchMap(this.getPaymentLimit));

		return combineLatest([productName$, countryIsoCode$]).pipe(
			map(([productName, countryIsoCode]) => isFeatureAccessible && this.isDirectBillingConfigured(productName, countryIsoCode)),
			switchMap((isEnabled) => (isEnabled ? getPaymentLimit$ : of(null))),
			shareReplay(1)
		);
	};

	private isDirectBillingConfigured(productName: string, countryIsoCode: string): boolean {
		return !!this.directBillingService.directBillingRules.find(
			(rule) => rule.country === countryIsoCode && (!rule.products || rule.products.includes(productName))
		);
	}

	private getPaymentLimit = (countryIsoCode: string): Observable<Limit> => {
		return this.directBillingService.getPaymentLimit(countryIsoCode);
	};

	private getTotalPremium = (businessCategories: { quoted: number }[]): number => {
		return businessCategories.map((businessCategory) => businessCategory.quoted).reduce((totalPremium, quoted) => totalPremium + quoted, 0);
	};

	private getIsDirectBillingVisible$ = (): Observable<boolean> => {
		const currencyIsoCode$ = this.getQuotePropertyObservable((quote) => quote.currency.isoCode);

		const brokerFeeExistsAndHasValue$ = this.quoteService.quote.pipe(map((quote) =>
			quote.commissionInformation.brokerFee !== null && quote.commissionInformation.brokerFee > 0));

		return combineLatest([this.paymentLimit$, currencyIsoCode$, brokerFeeExistsAndHasValue$]).pipe(
			map(([paymentLimit, currencyIsoCode, brokerFeeExistsAndHasValue]) => {
				return brokerFeeExistsAndHasValue === false && !!paymentLimit && paymentLimit.currency === currencyIsoCode
			}),
			shareReplay(1)
		);
	};

	private getContactDetails$ = (): Observable<ContactDetails | null> => {
		const clientUid$ = this.getQuotePropertyObservable((quote) => quote.client.uid);
		const isGetContactDetailsFeatureAccessible = this.userService.isFeatureAccessible("heroGetDirectBillingContactDetails");
		return combineLatest([this.isDirectBillingVisible$, clientUid$]).pipe(
			switchMap(([isVisible, clientUid]) =>
				isVisible && isGetContactDetailsFeatureAccessible ? this.directBillingService.getContactDetails(clientUid) : of(null)
			)
		);
	};

	private getQuotePropertyObservable = (project: (value: Quote) => any): Observable<any> => {
		return this.quoteService.quote.pipe(map(project), distinctUntilChanged(isEqual));
	};

	private getIsMaxLimitExceeded$ = (): Observable<boolean> => {
		return combineLatest([this.paymentLimit$, this.totalPremium$]).pipe(
			map(([paymentLimit, totalPremium]) => !!paymentLimit && paymentLimit.max < totalPremium),
			shareReplay(1)
		);
	};

	private watchTotalPremiumChange = (): void => {
		combineLatest([this.totalPremium$, this.paymentLimit$])
			.pipe(
				takeUntil(this._destroyed$),
				map(([totalPremium, paymentLimit]) => !!paymentLimit && paymentLimit.max >= totalPremium),
				tap((isEnabled) => (isEnabled ? this.isDirectBillingControl.enable() : this.disableBillingTypeControl()))
			)
			.subscribe();
	};

	private watchIsDirectBillingSelected = (): void => {
		this.isDirectBillingControl.valueChanges
			.pipe(
				takeUntil(this._destroyed$),
				tap((isSelected) => {
					this.directBillingService.setIsDirectBillingEnabled(isSelected);
					isSelected ? this.contactFormGroup.enable() : this.contactFormGroup.disable();
				})
			)
			.subscribe();
	};

	private watchPricingInformationChange = (): void => {
		const pricingInformation$ = this.getQuotePropertyObservable((quote) => quote.pricingInformation);

		pricingInformation$.pipe(takeUntil(this._destroyed$), map(this.buildBusinessCategoryFormGroups)).subscribe();
	};

	private watchExpiringPolicyTypeOfBilling() {
		const expiringPolicyNumber$ = this.getQuotePropertyObservable((quote) => quote.expiringPolicyNumber);

		expiringPolicyNumber$
			.pipe(
				takeUntil(this._destroyed$),
				switchMap((policyNumber) => {
					if (policyNumber) return this.transactionService.getTransactionsByPolicyNumber(policyNumber);
				}),
				tap(() => this.setIsDirectBillingControl())
			)
			.subscribe();
	}

	setIsDirectBillingControl(): void {
		this.formGroup.controls.isDirectBilling.setValue(this.transactionService.isExpiringPolicyDirectBilling);
		this.formGroup.controls.isDirectBilling.updateValueAndValidity();
	}

	private watchContactDetailsChange = (): void => {
		this.contactDetails$
			.pipe(
				takeUntil(this._destroyed$),
				tap((contactDetails) => {
					if (!!contactDetails) {
						this.contactFormGroup.patchValue(contactDetails);
					}
				})
			)
			.subscribe();
	};

	private disableBillingTypeControl = (): void => {
		this.isDirectBillingControl.setValue(false);
		this.isDirectBillingControl.disable();
	};

	private getIsPaymentPeriodVisible = (): Observable<boolean> => {

		const productName$ = this.getQuotePropertyObservable((quote) => quote.product.productName);
        const countryIsoCode$ = this.getQuotePropertyObservable((quote) => quote.client.primaryLocation.country.isoCode);
        const brokerGroupId$ = this.getQuotePropertyObservable((quote) => quote.brokerTeam.broker.brokerGroupId);
        var paymentPeriodRules = this.paymentService.paymentPeriodRules;

        return this.userService.isFeatureAccessible(this.paymentPeriodToggle) && combineLatest([productName$, countryIsoCode$, brokerGroupId$]).pipe(
            map(([productName, countryIsoCode, brokerGroupId]) => paymentPeriodRules.product == productName && paymentPeriodRules.country == countryIsoCode && paymentPeriodRules.brokerGroupId == brokerGroupId),
			shareReplay(1)
		);
	}

	private watchPaymentPeriodDetailsChange = (): void => {
		this.isPaymentPeriodControl.valueChanges.subscribe(value => {
			this.paymentService.setPaymentPeriod(value)
		})
	}
}