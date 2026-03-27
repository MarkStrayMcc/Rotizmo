import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { IsLoaded } from "@app/interfaces/IsLoaded";
import { map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as fromBasicInformationStore from '@app/basic-information-store';

import { BasicInformationViewModel } from '@app/quote/basic-information/basic-information-view/basic-information-view.component';
import { DropDownItem, BrokerTeam, SurplusLine } from '@app/models';

@Component({
  selector: "basic-information-shell",
  templateUrl: "./basic-information-shell.component.html",
  styleUrls: ["./basic-information-shell.component.scss"]
})
export class BasicInformationShellComponent implements OnInit, IsLoaded {
  @Output() public onValid = new EventEmitter<boolean>();
  @Output() public onInitialise = new EventEmitter();
  @Output() public onLoadCompleted = new EventEmitter();
  @Output() public onWarningChange = new EventEmitter<boolean>();

  // Form values
  public basicInformationFormValues$: Observable<BasicInformationViewModel>;
  public basicInformationFormCurrency$: Observable<DropDownItem>;
  public basicInformationFormLocalBroker$: Observable<BrokerTeam>;
  public basicInformationFormSurplusLinesBroker$: Observable<SurplusLine>;

  // Form options
  public currencies$: any = of([]);
  public countries$: any = of([]);
  public cfcContacts$: any = of([]);
  public localBrokers$: any = of([]);
  public insuranceTypes$: any = of([]);
  public quoteTypes$: any = of([]);
  public languages$: any = of([]);
  public wordings$: any = of([]);

  // Form state
  public showLocalBroker$: Observable<boolean>;
  public showSurplusLinesBroker$: Observable<boolean>;
  public readonly$: Observable<boolean>;

  // Validation
  public isAuthorisedLocation$: Observable<boolean>;

  constructor(
    private store: Store<fromBasicInformationStore.BasicInformationState>
  ) {
  }

  public ngOnInit() {
    this.initialiseSelectors();
  }

  // The following are all required to bridge the gap between the quote component
  // and the basic step component.
  public sendValid(isValid: boolean) {
    this.onValid.emit(isValid);
  }

  public sendInitialised() {
    this.onInitialise.emit();
  }

  public isLoaded(): boolean {
    return true;
  }

  public isValid(): boolean {
    return true;
  }

  public isDirty(): boolean {
    return true;
  }

  public markAsTouched() {
  }

  public onValueChange(data?: any) {
  }

  private initialiseSelectors() {
    // Form values
    this.basicInformationFormValues$ = this.store.pipe(
      select(fromBasicInformationStore.selectBasicInformationFormValues),
      map(formValues => ({
        client: formValues.client,
        brokerTeam: formValues.brokerTeam,
        brokerContact: formValues.brokerContact,
        surplusLinesBroker: formValues.surplusLinesBroker,
        localBroker: formValues.localBroker,
        quoteType: formValues.quoteType,
        insuranceType: formValues.insuranceType,
        product: formValues.product,
        assignedContact: formValues.assignedContact,
        address: formValues.address,
        currency: formValues.currency,
        inceptionDate: formValues.inceptionDate,
        policyPeriod: formValues.policyPeriod,
        expiringPolicyNumber: formValues.expiringPolicyNumber,
        language: formValues.language,
        wordingVersionId: formValues.wordingVersionId,
        hasEuSubsidiaries: formValues.hasEuSubsidiaries,
        expiryDate: formValues.expiryDate
      }) as BasicInformationViewModel)
    );

    this.basicInformationFormCurrency$ = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationCurrency));
    this.basicInformationFormLocalBroker$ = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationLocalBroker));
    this.basicInformationFormSurplusLinesBroker$ = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationSurplusLineBroker));

    // Form state
    this.showLocalBroker$ = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationShowLocalBroker));
    this.showSurplusLinesBroker$ = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationShowSurplusLinesBroker));
    this.readonly$ = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationReadonly));

    // Form options
    this.currencies$ = this.store.pipe(select(fromBasicInformationStore.selectCurrencies));
    this.countries$ = this.store.pipe(select(fromBasicInformationStore.selectCountries));
    this.cfcContacts$ = this.store.pipe(select(fromBasicInformationStore.selectCfcContacts));
    this.localBrokers$ = this.store.pipe(select(fromBasicInformationStore.selectLocalBrokers));
    this.insuranceTypes$ = this.store.pipe(select(fromBasicInformationStore.selectInsuranceTypes));
    this.quoteTypes$ = this.store.pipe(select(fromBasicInformationStore.selectQuoteTypes));
    this.languages$ = this.store.pipe(select(fromBasicInformationStore.selectLanguages));
    this.wordings$ = this.store.pipe(select(fromBasicInformationStore.selectWordings));

    // Validation
    this.isAuthorisedLocation$ = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationIsAuthorisedLocation));
  }

  public onSurplusLinesBrokerChange(newSurplusLinesBroker) {
    this.store.dispatch(fromBasicInformationStore.surplusLinesBrokerChange({ surplusLinesBroker: newSurplusLinesBroker }));
  }

  public onLocalBrokerChange(newLocalBroker) {
    this.store.dispatch(fromBasicInformationStore.localBrokerChange({ localBroker: newLocalBroker }));
  }

  public onInsuranceTypeChange(newInsuranceType) {
    this.store.dispatch(fromBasicInformationStore.insuranceTypeChange({ insuranceType: newInsuranceType }));
  }

  public onProductChange(newProduct) {
    this.store.dispatch(fromBasicInformationStore.productChange({ product: newProduct }));
  }

  public onQuoteTypeChange(newQuoteType) {
    this.store.dispatch(fromBasicInformationStore.quoteTypeChange({ quoteType: newQuoteType }));
  }

  public onAssignedChange(newAssignedContact) {
    this.store.dispatch(fromBasicInformationStore.assignedContactChange({ assignedContact: newAssignedContact }));
  }

  public onPolicyLanguageChange(newLanguage) {
    this.store.dispatch(fromBasicInformationStore.languageChange({ language: newLanguage }));
  }

  public onWordingVersionChange(newWordingVersionId) {
    this.store.dispatch(fromBasicInformationStore.wordingVersionIdChange({ wordingVersionId: newWordingVersionId }));
  }

  public onEuSubsidiaryQuestionChange(newHasEuSubsidiaries) {
    this.store.dispatch(fromBasicInformationStore.hasEuSubsidiariesChange({ hasEuSubsidiaries: newHasEuSubsidiaries }));
  }

  public expiringPolicyNumberChange(newExpiringPolicyNumber) {
    this.store.dispatch(fromBasicInformationStore.expiryPolicyNumberChange({ expiringPolicyNumber: newExpiringPolicyNumber }));
  }

  public onCurrencyChange(newCurrency) {
    this.store.dispatch(fromBasicInformationStore.currencyChange({ currency: newCurrency }));
  }

  public onTargetInceptionChange(newInceptionDate) {
    this.store.dispatch(fromBasicInformationStore.inceptionDateChange({ inceptionDate: newInceptionDate }));
  }

  public onPolicyPeriodChanged(newPolicyPeriod) {
    this.store.dispatch(fromBasicInformationStore.policyPeriodChange({ policyPeriod: newPolicyPeriod }));
  }

  public onAddressChanged(newAddress) {
    this.store.dispatch(fromBasicInformationStore.addressChange({ address: newAddress }));
  }
}
