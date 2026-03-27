/* tslint:disable:max-classes-per-file */
import { Component, EventEmitter, forwardRef, Injectable, Input, Output, Pipe, PipeTransform } from "@angular/core";
import { ControlValueAccessor, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { mockCfcContact } from "@app/mocks/cfc-contact.mock";
import {
	ActivityDetail,
	BinderValidationCriteria,
	CfcContact,
	Currency,
	PricingInformation,
	Quote,
	QuoteBindRequest,
	RiskQuestion,
	RiskQuestionAnswer,
	RiskQuestionType,
} from "@app/models";
import { CoverageItem } from "@app/quote/view-models/CoverageItem";
import { from, Observable, of } from "rxjs";
import { getTestQuote } from "test-helpers";
import { BrokerInformationResponse } from "../models/Brokers/BrokerInformationResponse";
import { QuoteAction } from '../models/QuoteAction';

@Component({
	selector: "autocomplete-dropdown",
	template: "",
})
export class MockAutocompleteDropdown {
	@Input() public myControl;
	@Input() public dataSource;
	@Input() public placeholderText;
	@Input() public isValid;
	@Input() public selectedValue;
	@Input() public customDisplayMethod;
}

@Component({
	selector: "datepicker",
	template: "",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			multi: true,
			useExisting: forwardRef(() => MockDatePicker),
		},
	],
})
export class MockDatePicker implements ControlValueAccessor {
	@Input() public value;
	@Input() public minimumDate;
	@Input() public maximumDate;
	@Input() public required;
	@Input() public readonly;
	@Output() public change: EventEmitter<any> = new EventEmitter();
	@Output() public focus: EventEmitter<any> = new EventEmitter();
	@Output() public blur: EventEmitter<any> = new EventEmitter();

	public writeValue = (obj) => (this.value = obj);
	public registerOnChange = (fn) => (this.onChangeFn = fn);
	public registerOnTouched = (fn) => (this.onFocusFn = fn);

	public onChangeFn() {
		return;
	}
	public onFocusFn() {
		return;
	}
}

@Component({
	providers: [
		{
			multi: true,
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MockCoverageComponent),
		},
	],
	selector: "coverage",
	template: "",
})
export class MockCoverageComponent implements ControlValueAccessor {
	@Input() public isSelected;
	@Input() public currency;
	@Input() public isFirstLoad;
	@Output() public isSelectedChange: EventEmitter<any> = new EventEmitter();
	@Output() public onSelection: EventEmitter<any> = new EventEmitter();
	@Output() public onDeselection: EventEmitter<any> = new EventEmitter();
	@Output() public onChange: EventEmitter<any> = new EventEmitter();
	@Output() public setForm: EventEmitter<any> = new EventEmitter();
	@Input() public readonly;
	@Input() public coverageItem: CoverageItem;

	public coverage;
	public writeValue = (obj) => {
		return;
	};
	public registerOnChange = (fn) => (this.onChangeFn = fn);
	public registerOnTouched = (fn) => (this.onFocusFn = fn);

	public onChangeFn() {
		return;
	}
	public onFocusFn() {
		return;
	}
}

@Component({
	selector: "activity-list",
	template: "",
})
export class MockActivityListComponent {
	@Input() public validatePercentage;
	@Input() public activityListVm;
	@Output() public activityAdded: EventEmitter<any> = new EventEmitter();
	@Output() public onChange: EventEmitter<any> = new EventEmitter();
	@Input() public readonly;
}

@Component({
	selector: "currency",
	template: "",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MockCurrencyComponent),
			multi: true,
		},
	],
})
export class MockCurrencyComponent implements ControlValueAccessor {
	@Input() public inputName;
	@Input() public isRequired;
	@Input() public decimals;
	@Input() public readonly;
	@Input() public currency;
	@Input() public value;
	@Input() public hasWarning: boolean = false;
	@Input() public warningText: string;

	public writeValue = (obj) => (this.value = obj);
	public registerOnChange = (fn) => (this.onChangeFn = fn);
	public registerOnTouched = (fn) => (this.onFocusFn = fn);

	public onChangeFn() {
		return;
	}
	public onFocusFn() {
		return;
	}
}

@Component({
	selector: "mat-progress-spinner",
	template: "",
})
export class MockMatProgressSpinner {}

@Component({
	selector: "business-line",
	template: "",
})
export class MockBusinessCategoryPricingComponent {
	@Input() public form;
	@Input() public name;
	@Input() public isNewQuote = false;
	@Input() public currency;
	@Input() public quoteState: number = 1;
	@Output() public quoteChanged = new EventEmitter();
	@Output() public expandedChanged = new EventEmitter();
	@Input() public readonly;
	@Input() public quote;
}

@Component({
	selector: "commission-pricing",
	template: "",
})
export class MockCommissionPricing {
	@Input() public form: FormGroup;
	@Input() public currency: Currency;
	@Input() public readonly: boolean = false;
}

@Pipe({ name: "valueArray" })
export class MockValueArray implements PipeTransform {
	public transform(objects: any = []) {
		return Object.keys(objects).map((key) => objects[key]);
	}
}

@Injectable()
export class MockDropdownService {
	public getCountries = () => from([]);
	public getCurrencies = () => from([]);
	public getCurrencyByCountryId = () => from([]);
	public getCfcContacts = () => from([]);
	public getProducts = () => from([]);
	public getInsuranceTypes = () => from([]);
	public getAutocompleteAddresses = () => from([]);
	public getCountryStates = () => from([]);
	public getLanguages = () => from([]);
	public getSurplusLines = () => from([]);
	public getQuoteTypes = () => from([]);
}

@Injectable()
export class MockCoverageAuthorityService {
	public updateQuote(quote: Quote) {
		return;
	}
	public setWarningStatus(key: string, isWarningEnabled: boolean) {
		return;
	}
	public getWarningEvent(): Observable<boolean> {
		return of(true);
	}
	public getLimitAuthorityRule(filters: any): any {
		return;
	}
	public isBoundQuote(): boolean {
		return true;
	}
}

@Injectable()
export class MockUserService {
	public isLocationAllowedToBind() {
		return;
	}
	public getData(): Observable<CfcContact> {
		return of(mockCfcContact);
	}
	public getUser(): Observable<CfcContact> {
		return of(mockCfcContact);
	}
	public isFeatureAccessible(feature: string) {
		return true;
	}
}

@Injectable()
export class MockFeaturesHttpService {
	public isFeatureActive = () => {
		return of();
	};
}

@Injectable()
export class MockWordingVersionHttpService {
	public getWordingVersions = () => from([]);
}

@Injectable()
export class MockDropDownManagerService {
	public setDropDownItem<T>() {
		return;
	}
	public setAssignedContactDropDownItem() {
		return;
	}
	public setCurrencyDropDownItem() {
		return;
	}
	public setCountryDropDownItem() {
		return;
	}
	public setRiskSelectOption() {
		return;
	}
	public setObjectFromDropDownItem<T>() {
		return;
	}
	public setCurrencyFromDropDownItem() {
		return;
	}
	public setAssignedContactFromDropDownItem() {
		return;
	}
	public setCountryFromDropDownItem(item) {
		return;
	}
	public setValueToDropDownObject(dropDownObj: any): any {
		return [];
	}
}

@Injectable()
export class MockModalDialogService {
	public openDialog<T, TY>() {
		return;
	}
	public toggleBackgroundScrollbarShift() {
		return;
	}
	public toggleHtmlScrollbar() {
		return;
	}
	public setOverlayBackdropHeight() {
		return;
	}
}

@Injectable()
export class MockCoverageHttpService {
	public getAvailable = () => from([]);
}

@Injectable()
export class MockCoverageService {
	public getSelectedCoverageIndex() {
		return;
	}
	public getSelectedCoverage() {
		return;
	}
	public getAvailableSelectedCoverages() {
		return;
	}
}

@Injectable()
export class MockCoverageItemService {
	public getCoverageItems() {
		return;
	}
	public saveCoverageExpandedState() {
		return;
	}
	public getCoverageExpandedState() {
		return;
	}
}

@Injectable()
export class MockPricingHttpService {
	public getCommissionRate = () => from([10]);
}

@Injectable()
export class MockPremiumCalculationsService {
	public calculatePremium(quote: Quote) {
		return;
	}

	public getCalculatedQuotePremium(quote: Quote | QuoteBindRequest) {
		return 0;
	}

	public calculateTotalFee(quote: Quote) {
		return;
	}
	public calculateFeeSplit(quote: Quote) {
		return;
	}
}

@Injectable()
export class MockPricingService {
	public isCalculating: boolean = false;

	// tslint:disable-next-line:no-empty
	public updateBusinesLines(quote: Quote): void {}

	public getPricingInformation(quote: Quote): Observable<PricingInformation[]> {
		return from([[]]);
	}

	public getBusinessLines(quote: Quote, withAdditionalCoverages: boolean = false) {
		return from([]);
	}
}

@Injectable()
export class MockRiskHttpService {
	public getRiskQuestionsForDraft = (): Observable<RiskQuestion[]> => {
		const dummyQuestion = new RiskQuestion();
		dummyQuestion.label = "the best label";
		dummyQuestion.type = RiskQuestionType.freeText;
		const result = new Array<RiskQuestion>();
		result.push(dummyQuestion);
		return of(result);
	};
}

@Injectable()
export class MockSubjectivitiesHttpService {
	public getMainData = () => from([]);
	public getDefaultSubjectivities = () => from([]);
	public getAllDefaultSubjectivitiesIds = () => from([]);
}

@Injectable()
export class MockEndorsementHttpService {
	public getAvailable = () => from([]);
	public getAutoAttaching = () => from([]);
}

@Injectable()
export class MockQuoteSubjectivityService {
	public formatSubjectivityDisplayText = () => "";
}

@Injectable()
export class MockBinderValidationService {
	public loadBinderValidationCriterias(draftQuoteId: string, businessLineCodes: string) {
		return;
	}

	public loadCriteriasForSelectedBusinessCategories(quote: Quote) {
		return;
	}
	public get binderValidationCriterias(): {
		[businessCategoryTagName: string]: BinderValidationCriteria[];
	} {
		return {};
	}

	public filterBindersCriteriaBasedOnRevenueFirst(quote: Quote): void {
		return;
	}

	public getBinderValidationWarningForTab(stepComp: number, businessCategory?: string): string[] {
		return [];
	}
}

export class MockMatDialog {}

export class MockBrokerContactHttpService {
	public getBrokerContact = () => of(new BrokerInformationResponse());
}

export class MockNavigationoverride {}

export class MockMatDialogRef<T> {
	public close(dialogResult?: any): void {
		return;
	}
}

export class MockTaxService {
	public updateGSTRate = () => from([0.1]);
}

export class MockFeeHttpService {
	public getMaximumFee(a, b) {
		return of(null);
	}
	public getDefaultFee(a, b) {
		return of(null);
	}
	public getFee(a, b) {
		return of(null);
	}
}

export class MockClientClearanceService {
	public checkClientClearanceForBroker = () => {};
}

export class MockCurrencyService {
	public getCurrencyRateByIsoCode = () => of(1);
}

export class MockClientLatestReferenceHttpService {
	public checkClientClearanceForBroker = () => {};
}

export class MockQuoteService {
	public updateQuote = () => {};
	public getQuote(): Quote {
		return getTestQuote();
	}
	public getQuoteReference(): Quote {
		return getTestQuote();
	}
	public getOriginalQuote(): Quote {
		return getTestQuote();
	}
	public getActivities(): ActivityDetail[] {
		return getTestQuote().activities;
	}
    public setPropertyValue = () => { }
	public getCurrency(): Currency {
		return getTestQuote().currency;
	}
	public getRiskQuestionAnswers(): RiskQuestionAnswer[] {
		return getTestQuote().riskQuestionAnswers;
	}
    public propertyChanged$: Observable<QuoteAction> = of();
}

@Component({
	selector: "risk-panel",
	template: "",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MockRiskPanelComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => MockRiskPanelComponent),
			multi: true,
		},
	],
})
export class MockRiskPanelComponent implements ControlValueAccessor, Validator {
	@Input() public riskQuestions: RiskQuestion[];
	@Input() public quote: Quote;
	@Input() public isRiskStep: boolean;
	@Output() public onWarningChange = new EventEmitter<boolean>();

	public writeValue(): void {}
	public registerOnChange(): void {}
	public registerOnTouched(): void {}
	public setDisabledState?(): void {}
	public validate(): ValidationErrors {
		return {};
	}
	public registerOnValidatorChange?(): void {}
}

export class MockRiskService {
	public updateRiskQuestions(): Observable<RiskQuestion[]> {
		return from([[]]);
	}
	public getRiskQuestions = () => [];
	public updateRiskQuestionAnswers(): void {}
}

@Injectable()
export class MockSurplusLineHttpService {
	public getSurplusLines = () => from([[]]);
}

@Component({
	selector: "surplus-line-selector",
	template: "",
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MockSurplusLineSelectorComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => MockSurplusLineSelectorComponent),
			multi: true,
		},
	],
})
export class MockSurplusLineSelectorComponent implements ControlValueAccessor, Validator {
	@Input() public state: string;
	@Input() public brokerTeamId: number;
	@Input() public enableNewSurplusLines: boolean;

	public writeValue(): void {}
	public registerOnChange(): void {}
	public registerOnTouched(): void {}
	public registerOnValidatorChange?(): void {}
	public setDisabledState?(): void {}
	public validate(): ValidationErrors {
		return null;
	}
}
