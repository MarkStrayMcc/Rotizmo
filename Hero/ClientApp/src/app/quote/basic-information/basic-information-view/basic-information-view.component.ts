import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  Input,
  OnInit,
  OnDestroy
} from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { MatDialogConfig } from "@angular/material";

import * as moment from "moment";
import { Observable, Subscription } from "rxjs";
import { distinctUntilChanged, tap, debounceTime } from "rxjs/operators";

import { Datepicker } from "@app/components/datepicker/datepicker.component";
import { QuoteType } from "@app/constants/QuoteType";
import { DBOperation } from "@app/enums/DBOperations";
import { markFormGroupControlsTouched } from "@app/helpers/form-helper";
import {
  BrokerTeam,
  DropDownItem,
  Product,
  Client,
  ClientLocation,
  SurplusLine
} from "@app/models";
import { AddressClientLocationModal } from "@app/quote/popups/client-address-modal.model";
import { ProductSelectorModal } from "@app/quote/popups/selector-modals/product-selector-modal/product-selector-modal.component";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { DateValidators } from "@app/validators/date.validators";
import { isEqual } from "lodash";

export interface BasicInformationViewModel {
  client: Client;
  brokerTeam: BrokerTeam;
  localBroker: BrokerTeam;
  surplusLinesBroker: SurplusLine;
  quoteType: string;
  insuranceType: number;
  product: Product;
  assignedContact: DropDownItem;
  address: ClientLocation;
  currency: DropDownItem;
  inceptionDate: moment.Moment;
  policyPeriod: number;
  expiryDate: Date;
  expiringPolicyNumber: string;
  language: number;
  wordingVersionId: number;
  hasEuSubsidiaries: boolean;
}

@Component({
  selector: "basic-information-view",
  templateUrl: "basic-information-view.component.html",
  styleUrls: ["basic-information-view.component.scss"]
})
export class BasicInformationViewComponent implements OnInit, OnDestroy {
  @ViewChild("inceptionDateInput")
  public inceptionDate: Datepicker;

  @Input() public viewModel: BasicInformationViewModel;
  @Input() public showSurplusLinesBroker: boolean;
  @Input() public showLocalBroker: boolean;
  @Input() public isAuthorisedLocation: boolean;

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

  public get readonly(): boolean {
    return this.readonlyValue;
  }

  private _wordingversions$: Observable<DropDownItem[]>;

  @Input("wordingversions")
  public set wordingversions$(value: Observable<DropDownItem[]>) {
    this._wordingversions$ = value.pipe(
      tap(values => this.setWordingDefaultValue(values))
    );
  }

  public get wordingversions$() {
    return this._wordingversions$;
  }

  // Presentation
  public formErrors = {
    assignedContact: [],
    currency: [],
    inceptionDate: [],
    policyPeriod: [],
    languages: [],
    wordingVersion: []
  };

  // Presentation
  public validationMessages = {
    assignedContact: {
      required: "Required",
      invalidOption: "Please select a valid contact"
    },
    currency: {
      required: "Required",
      invalidOption: "Please select a valid currency"
    },
    inceptionDate: {
      required: "Required",
      invalidDate: "Invalid date",
      toearly: "Before minimum date",
      tolate: "After maximum date"
    },
    policyPeriod: {
      min: "Cannot be less than 1 month",
      max: "Cannot be greater than 96 months",
      required: "Required"
    },
    language: {
      required: "Required"
    },
    wordingVersion: {
      required: "Required"
    },
    localBroker: {
      invalidOption: "Please select a valid option"
    }
  };

  @Input() public formCurrency$: Observable<DropDownItem>;
  @Input() public formLocalBroker$: Observable<BrokerTeam>;
  @Input() public formSurplusLinesBroker$: Observable<SurplusLine>;

  @Input() public quoteTypes: DropDownItem[];
  @Input() public insuranceTypes: DropDownItem[];
  @Input() public languages: DropDownItem[];
  @Input() public countries: Observable<DropDownItem[]>;
  @Input() public currencies: Observable<DropDownItem[]>;
  @Input() public cfccontacts: Observable<DropDownItem[]>;
  @Input() public localBrokers: Observable<BrokerTeam[]>;

  @Output() public onValid = new EventEmitter<boolean>();
  @Output() public onInitialise = new EventEmitter();

  @Output() public valueChanged = new EventEmitter();
  @Output() public surplusLinesBrokerChanged = new EventEmitter();
  @Output() public localBrokerChanged = new EventEmitter();
  @Output() public quoteTypeChanged = new EventEmitter();
  @Output() public insuranceTypeChanged = new EventEmitter();
  @Output() public productChanged = new EventEmitter();
  @Output() public assignedChanged = new EventEmitter();
  @Output() public addressChanged = new EventEmitter();
  @Output() public currencyChanged = new EventEmitter();
  @Output() public targetInceptionChanged = new EventEmitter();
  @Output() public policyPeriodChanged = new EventEmitter();
  @Output() public policyLanguageChanged = new EventEmitter();
  @Output() public wordingVersionChanged = new EventEmitter();
  @Output() public euSubsidiaryQuestionChanged = new EventEmitter();
  @Output() public expiringPolicyNumberChanged = new EventEmitter();

  private formSubscription: Subscription;
  private formCurrencySubscription: Subscription;
  private formLocalBrokerSubscription: Subscription;
  private formSurplusLinesBrokerSubscription: Subscription;
  private sLBrokerSubscription: Subscription;
  private localBrokerSubscription: Subscription;
  private quoteTypeSubscription: Subscription;
  private insuranceTypeSubscription: Subscription;
  private productSubscription: Subscription;
  private assignedSubscription: Subscription;
  private addressSubscription: Subscription;
  private currencySubscription: Subscription;
  private targetInceptionSubscription: Subscription;
  private policyPeriodSubscription: Subscription;
  private policyLanguageSubscription: Subscription;
  private wordingVersionSubscription: Subscription;
  private euSubsidiaryQuestionSubscription: Subscription;
  private expiringPolicyNumberSubscription: Subscription;

  public msgError: string;
  public currentFocus: string = "";
  public addressClientModalModel: AddressClientLocationModal = new AddressClientLocationModal();
  private valid = true;
  private readonlyValue = false;

  // TODO: Move to FormBuilder
  public stepForm: FormGroup;

  // Form-related
  public isValid(): boolean {
    if (this.readonly) {
      return true;
    }

    return this.valid && !this.stepForm.invalid;
  }

  public get selectedProduct(): Product {
    const product = this.stepForm.controls.product.value;
    return product;
  }

  public get brokerTeamName() {
    return this.getBrokerTeamName(this.viewModel.brokerTeam);
  }

  // Presentation-related. Might be a woraround for the recalculate buttons?
  public markAsTouched(): void {
    markFormGroupControlsTouched(this.stepForm);
    return;
  }

  constructor(
    // TODO: Inject the BasicInformationFormBuilder
    private readonly fb: FormBuilder,
    private readonly modalDialogService: ModalDialogService
  ) {}

  public ngOnInit(): void {
    // TODO: Move StepForm to BasicInformationFormBuilder.Build()
    this.stepForm = this.fb.group({
      surplusLinesBroker: [
        { value: this.viewModel.surplusLinesBroker, disabled: this.readonly }
      ],
      localBroker: [
        { value: this.viewModel.localBroker, disabled: this.readonly },
        AutocompleteSelectedValidator
      ],
      quoteType: [
        { value: this.viewModel.quoteType, disabled: this.readonly },
        [Validators.required]
      ],
      insuranceType: [
        { value: this.viewModel.insuranceType, disabled: this.readonly }
      ],
      product: [{ value: this.viewModel.product, disabled: this.readonly }],
      assignedContact: [
        { value: this.viewModel.assignedContact, disabled: this.readonly },
        [Validators.required, AutocompleteSelectedValidator]
      ],
      address: [{ value: this.viewModel.address, disabled: this.readonly }],
      currency: [
        { value: this.viewModel.currency, disabled: this.readonly },
        [Validators.required, AutocompleteSelectedValidator]
      ],
      inceptionDate: [
        { value: this.viewModel.inceptionDate, disabled: this.readonly },
        [Validators.required, DateValidators.date()]
      ],
      policyPeriod: [
        { value: this.viewModel.policyPeriod, disabled: this.readonly },
        [Validators.required, Validators.min(1), Validators.max(96)]
      ],
      expiringPolicyNumber: [
        { value: this.viewModel.expiringPolicyNumber, disabled: this.readonly }
      ],
      language: [
        { value: this.viewModel.language, disabled: this.readonly },
        [Validators.required]
      ],
      wordingVersion: [
        { value: this.viewModel.wordingVersionId, disabled: this.readonly },
        [Validators.required, Validators.min(1)]
      ],
      euSubsidiaryQuestion: [
        { value: this.viewModel.hasEuSubsidiaries, disabled: this.readonly }
      ]
    });

    this.setAddressModalData();
    this.initialiseChangeListeners();

    if (!this.viewModel.product) {
      setTimeout(() => this.openProductSelectorDialog(), 0);
    }
  }

  private setWordingDefaultValue(values) {
    if (values) {
      let newWordingVersionId: number = this.viewModel.wordingVersionId;

      const wordingIds = values.map(i => Number(i.value));
      if (!wordingIds.some(i => i === newWordingVersionId)) {
        if (values.length > 0) {
          newWordingVersionId = Math.max(...wordingIds);
        } else {
          newWordingVersionId = null;
        }
      }

      this.stepForm.controls.wordingVersion.patchValue(newWordingVersionId);
    }
  }

  private initialiseChangeListeners(): void {
    this.formSubscription = this.stepForm.valueChanges
      .pipe(distinctUntilChanged(isEqual))
      .subscribe(data => this.onValueChanged(data));

    this.formCurrencySubscription = this.formCurrency$.subscribe((currency) => {
      const currentCurrency = this.stepForm.controls.currency.value;
      if (currentCurrency.value !== currency.value) {
        this.stepForm.controls.currency.patchValue(currency);
      }
    });

    this.formLocalBrokerSubscription = this.formLocalBroker$.subscribe((localBroker: BrokerTeam) => {
      const currentLocalBroker = this.stepForm.controls.localBroker.value as BrokerTeam;
      if (
        (currentLocalBroker && localBroker === null) ||
        (currentLocalBroker === null && localBroker) ||
        (currentLocalBroker && localBroker && currentLocalBroker.id !== localBroker.id)
        ) {
          this.stepForm.controls.localBroker.patchValue(localBroker);
        }
    });

    this.formSurplusLinesBrokerSubscription = this.formSurplusLinesBroker$.subscribe((surplusLinesBroker: SurplusLine) => {
      const currentSurplusLinesBroker = this.stepForm.controls.surplusLinesBroker.value as SurplusLine;
      if (
        (currentSurplusLinesBroker && surplusLinesBroker === null) ||
        (currentSurplusLinesBroker === null && surplusLinesBroker) ||
        (currentSurplusLinesBroker && surplusLinesBroker && currentSurplusLinesBroker.id !== surplusLinesBroker.id)
        ) {
          this.stepForm.controls.surplusLinesBroker.patchValue(surplusLinesBroker);
        }
    });

    this.localBrokerSubscription = this.stepForm.controls.localBroker.valueChanges
    .pipe(debounceTime(600))
    .subscribe(
      newLocalBroker => this.onLocalBrokerChange(newLocalBroker)
    );

    this.sLBrokerSubscription = this.stepForm.controls.surplusLinesBroker.valueChanges
    .pipe(debounceTime(600))
    .subscribe(
      slLineBroker => this.onSurplusLineBrokerChange(slLineBroker)
    );

    this.quoteTypeSubscription = this.stepForm.controls.quoteType.valueChanges.subscribe(
      (quoteTypeValue: string) => this.onQuoteTypeChange(quoteTypeValue)
    );

    this.insuranceTypeSubscription = this.stepForm.controls.insuranceType.valueChanges.subscribe(
      (insuranceTypeValue: string) =>
        this.onInsuranceTypeChange(insuranceTypeValue)
    );

    this.productSubscription = this.stepForm.controls.product.valueChanges.subscribe(
      newProduct => this.onProductChange(newProduct)
    );

    this.assignedSubscription = this.stepForm.controls.assignedContact.valueChanges
    .pipe(debounceTime(600))
    .subscribe(
      newContact => this.onAssignedContactChange(newContact)
    );

    this.addressSubscription = this.stepForm.controls.address.valueChanges.subscribe(
      newAddress => this.onAddressChange(newAddress)
    );

    this.currencySubscription = this.stepForm.controls.currency.valueChanges
    .pipe(debounceTime(600))
    .subscribe(
      newCurrency => this.onCurrencyChange(newCurrency)
    );

    this.targetInceptionSubscription = this.stepForm.controls.inceptionDate.valueChanges
    .pipe(debounceTime(600))
    .subscribe(
      date => this.onInceptionDateChange(date)
    );

    this.policyPeriodSubscription = this.stepForm.controls.policyPeriod.valueChanges
    .pipe(debounceTime(600))
    .subscribe(
      period => this.onPolicyPeriodChange(period)
    );

    this.policyLanguageSubscription = this.stepForm.controls.language.valueChanges.subscribe(
      newLanguage => this.onLanguageChange(newLanguage)
    );

    this.wordingVersionSubscription = this.stepForm.controls.wordingVersion.valueChanges.subscribe(
      newWording => this.onWordingVersionChange(newWording)
    );

    this.euSubsidiaryQuestionSubscription = this.stepForm.controls.euSubsidiaryQuestion.valueChanges.subscribe(
      isEuSubsidiary => this.onEuSubsidiaryQuestionChange(isEuSubsidiary)
    );

    this.expiringPolicyNumberSubscription = this.stepForm.controls.expiringPolicyNumber.valueChanges.subscribe(
      expiringPolicyNumer =>
        this.expiringPolicyNumberChange(expiringPolicyNumer)
    );
  }

  public ngOnDestroy(): void {
    this.destroySubscription(this.formSubscription);
    this.destroySubscription(this.formCurrencySubscription);
    this.destroySubscription(this.formLocalBrokerSubscription);
    this.destroySubscription(this.formSurplusLinesBrokerSubscription);
    this.destroySubscription(this.sLBrokerSubscription);
    this.destroySubscription(this.localBrokerSubscription);
    this.destroySubscription(this.quoteTypeSubscription);
    this.destroySubscription(this.insuranceTypeSubscription);
    this.destroySubscription(this.productSubscription);
    this.destroySubscription(this.assignedSubscription);
    this.destroySubscription(this.addressSubscription);
    this.destroySubscription(this.currencySubscription);
    this.destroySubscription(this.targetInceptionSubscription);
    this.destroySubscription(this.policyPeriodSubscription);
    this.destroySubscription(this.policyLanguageSubscription);
    this.destroySubscription(this.wordingVersionSubscription);
    this.destroySubscription(this.euSubsidiaryQuestionSubscription);
    this.destroySubscription(this.expiringPolicyNumberSubscription);

    this.onValid.emit(this.isValid());
  }

  private destroySubscription(subscription: Subscription) {
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  public onValueChanged(data?: any) {
    this.validateForm();
    this.valueChanged.emit(data);
  }

  private onSurplusLineBrokerChange(slBroker) {
    this.surplusLinesBrokerChanged.emit(slBroker);
  }

  private onLocalBrokerChange(localBroker) {
    this.localBrokerChanged.emit(localBroker);
  }

  private onQuoteTypeChange(quoteTypeValue: QuoteType) {
    if (quoteTypeValue === QuoteType.Renewal) {
      this.stepForm.controls.expiringPolicyNumber.setValidators([
        Validators.required
      ]);
    } else {
      this.stepForm.controls.expiringPolicyNumber.clearValidators();
    }
    this.stepForm.controls.expiringPolicyNumber.updateValueAndValidity();
    this.quoteTypeChanged.emit(quoteTypeValue);
  }

  private onInsuranceTypeChange(newInsuranceType) {
    this.insuranceTypeChanged.emit(newInsuranceType);
  }

  private onProductChange(newProduct: Product) {
    this.productChanged.emit(newProduct);
  }

  private onAssignedContactChange(newContact) {
    this.assignedChanged.emit(newContact);
  }

  private onAddressChange(newAddress) {
    if (this.addressClientModalModel) {
      this.addressClientModalModel.defaultLocation = newAddress;
      this.stepForm.get("surplusLinesBroker").setValue(null);
    }

    this.addressChanged.emit(newAddress);
  }

  private onCurrencyChange(newCurrency) {
    this.currencyChanged.emit(newCurrency);
  }

  private onInceptionDateChange(newDate: moment.Moment) {
    const inceptionDate = newDate
      ? newDate
      : moment(this.stepForm.value.inceptionDate);
    this.targetInceptionChanged.emit(inceptionDate);
  }

  public onPolicyPeriodChange(newPeriod) {
    this.policyPeriodChanged.emit(newPeriod);
  }

  private onLanguageChange(newLanguage) {
    this.policyLanguageChanged.emit(newLanguage);
  }

  public onWordingVersionChange(wording: DropDownItem) {
    this.wordingVersionChanged.emit(wording);
  }

  public onEuSubsidiaryQuestionChange(isChecked: boolean) {
    this.euSubsidiaryQuestionChanged.emit(isChecked);
  }

  public expiringPolicyNumberChange(expiringPolicyNumber) {
    this.expiringPolicyNumberChanged.emit(expiringPolicyNumber);
  }

  private validateForm() {
    this.valid = true;

    for (const field in this.formErrors) {
      if (!this.formErrors.hasOwnProperty(field)) {
        continue;
      }

      // clear previous error message (if any)
      this.formErrors[field] = [];
      const control = this.stepForm.get(field);

      if (control && control.invalid) {
        this.valid = false;
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          if (!control.errors.hasOwnProperty(key)) {
            continue;
          }
          this.formErrors[field].push(messages[key]);
        }
      }
    }
  }

  // Product Dialog
  public openProductSelectorDialog() {
    if (this.readonly) {
      return;
    }

    const config: MatDialogConfig = {
      width: "680px",
      hasBackdrop: true
    };

    this.modalDialogService.openDialog<ProductSelectorModal, Product>(
      ProductSelectorModal,
      config,
      obj => {
        obj.isOutsideProductSelected = this.stepForm.controls.product.value > 0;
      },
      (newProduct: Product) =>
        this.stepForm.controls.product.setValue(newProduct)
    );
  }

  public setAddressModalData(): void {
    if (!this.addressClientModalModel) {
      this.addressClientModalModel = new AddressClientLocationModal();
    }

    this.addressClientModalModel.dbOperation = DBOperation.noAction;

    if (this.viewModel.address) {
      this.addressClientModalModel.defaultLocation = this.viewModel.address.country;
    }

    if (!this.addressClientModalModel.client) {
      this.addressClientModalModel.client = this.viewModel.client;
    }
  }

  public displayExpiringPolicyNumber() {
    return this.stepForm.controls.quoteType.value === QuoteType.Renewal;
  }

  public getBrokerTeamName(brokerTeam: BrokerTeam): string {
    if (brokerTeam && brokerTeam.broker) {
      (brokerTeam as any).value = brokerTeam.id;
      return `${brokerTeam.broker.companyName} (${brokerTeam.broker.city}, ${brokerTeam.name})`;
    } else {
      return "";
    }
  }
}
