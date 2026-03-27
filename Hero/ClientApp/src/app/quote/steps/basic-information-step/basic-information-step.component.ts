import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, Validators } from "@angular/forms";
import { MatDialogConfig } from "@angular/material/dialog";
import { Datepicker } from "@app/components/datepicker/datepicker.component";
import { QuoteType } from "@app/constants/QuoteType";
import { DBOperation } from "@app/enums/DBOperations";
import { MessageCategory } from "@app/enums/MessageCategory";
import { MessageType } from "@app/enums/MessageType";
import { isAdmitted, isCanada, isCanadianBroker, isUnitedStates, isAustralia } from "@app/helpers";
import { markFormGroupControlsTouched } from "@app/helpers/form-helper";
import { IsDirty } from "@app/interfaces/IsDirty";
import { IsLoaded } from "@app/interfaces/IsLoaded";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import {
    InsuranceBasis,
    InsuranceBasisDescriptions,
    Broker,
    BrokerContact,
    BrokerTeam,
    CfcContact,
    ClientLocation,
    Country,
    Currency,
    DropDownItem,
    EnquirySearchResult,
    Product,
    Quote,
    QuoteState,
} from "@app/models";
import { LatestQuoteReferenceRequest } from "@app/models/auto-generated/LatestQuoteReferenceRequest";
import { Message } from "@app/models/Message";
import { BrokerInformationResponse } from "@app/quote/models/Brokers/BrokerInformationResponse";
import { AddressMapViewModal } from "@app/quote/popups/address-map-view-modal.component";
import { ClientAddressModal } from "@app/quote/popups/client-address-modal.component";
import { AddressClientLocationModal } from "@app/quote/popups/client-address-modal.model";
import { ClientManageAddressModal } from "@app/quote/popups/client-manageaddress-modal.component";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { BrokerSelectorModalComponent } from "@app/quote/popups/selector-modals/broker-selector-modal/broker-selector-modal.component";
import { ProductSelectorModal } from "@app/quote/popups/selector-modals/product-selector-modal/product-selector-modal.component";
import { CountryService } from "@app/quote/services/country.service";
import { CurrencyService } from "@app/quote/services/currency.service";
import { LanguageService } from "@app/quote/services/language.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { WordingVersionService } from "@app/quote/services/wording-version/wording-version-service";
import { BaseStepComponent } from "@app/quote/steps/base-step.component";
import { BrokerContactHttpService } from "@app/services/broker-contact-http-service";
import { ClientClearanceService } from "@app/services/client-clearance-service";
import { ClientLatestReferenceHttpService } from "@app/services/client-latestreference-http.service";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { UserService } from "@app/services/user.service";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { DateValidators } from "@app/validators/date.validators";
import * as moment from "moment";
import { Observable, ReplaySubject, Subject, Subscription } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { SurplusLineHttpService } from '@app/services/surplus-line.http-service';

@Component({
    selector: "basic-information-step",
    templateUrl: "basic-information-step.component.html",
    styleUrls: ["basic-information-step.component.scss"],
})
export class BasicInformationStepComponent extends BaseStepComponent implements IsValid, IsDirty, IsLoaded, MarkAsTouched, OnInit, OnDestroy {
    @ViewChild("inceptionDateInput")
    public inceptionDate: Datepicker;

    protected get insuranceBasisDescriptions() {
        return InsuranceBasisDescriptions;
    }

    isInsuranceBasisDisabled: boolean = true;

    @Output() public onAddressChanged = new EventEmitter();

    @Output() public onExpiringPolicyNumberChanged = new EventEmitter();

    @Output() public onQuoteTypeChanged = new EventEmitter();

    private readonly excludedQuoteKeysFromReset: string[] = [
        "draftQuoteId",
        "enquiryId",
        "enquiryUid",
        "insuranceTypeId",
        "client",
        "clientLocationId",
        "clientLocation",
        "brokerTeam",
        "brokerContact",
        "brokerGroup",
        "surplusLineBroker",
        "insuredLocation",
        "languageId",
        "currencyId",
        "currency",
        "inceptionDate",
        "policyPeriod",
        "expiryDate",
        "assignedContactId",
        "assignedContact",
        "createdByUnderwriter",
        "nerdVersion",
        "wordingVersionId",
        "state",
        "quoteType",
        "expiringPolicyNumber",
        "insuranceType",
        "insuranceBasis",
    ];

    public insuranceTypes: DropDownItem[];
    public quoteTypes: DropDownItem[];
    public languages: DropDownItem[];
    public wordingVersions: DropDownItem[];
    public excessWordingVersions: DropDownItem[];
    public msgError: string;
    public countries: Observable<DropDownItem[]>;
    public currencies: Observable<DropDownItem[]>;
    public cfccontacts: Observable<DropDownItem[]>;
    public currentFocus = "";
    public isAuthorisedLocation: boolean = true;

    public formErrors = {
        assignedContact: [],
        currency: [],
        inceptionDate: [],
        policyPeriod: [],
        languages: [],
        wordingVersion: [],
        excessWordingVersion: [],
    };

    private messageClientLatestReference$ = new Subject<MessageCategory>();
    private modalModel: AddressClientLocationModal = new AddressClientLocationModal();
    private valid = true;
    public approvedState: number = QuoteState.Approved;
    private insuranceTypesSubscription: Subscription;
    private quoteTypesSubscription: Subscription;
    private languageSubscription: Subscription;
    private formSubscription: Subscription;
    private wordingVersionSubscription: Subscription;
    private excessWordingVersionSubscription: Subscription;
    private inceptionDateSubscription: Subscription;
    private quoteTypeSubscription: Subscription;
    private sLBrokerSubscription: Subscription;
    private localBrokerSubscription: Subscription;
    private addressValueChanged = false;
    public isInceptionDateInFocus = false;
    private readonly _destroyed$ = new ReplaySubject<void>(1);

    public validationMessages = {
        assignedContact: {
            required: "Required",
            invalidOption: "Please select a valid contact",
        },
        currency: {
            required: "Required",
            invalidOption: "Please select a valid currency",
        },
        inceptionDate: {
            required: "Required",
            invalidDate: "Invalid date",
            toearly: "Before minimum date",
            tolate: "After maximum date",
        },
        policyPeriod: {
            min: "Cannot be less than 1 month",
            max: "Cannot be greater than 96 months",
            required: "Required",
        },
        languages: {
            required: "Required",
        },
        wordingVersion: {
            required: "Required",
        },
        excessWordingVersion: {
            required: "Required",
        },
    };

    public isDirty(): boolean {
        return this.checkDataChanged();
    }

    public isValid(): boolean {
        if (this.readonly) {
            return true;
        }

        return this.valid && !this.stepForm.invalid && this.checkState();
    }

    public checkState(): boolean {
        return !(this.countryHasState && (!this.vm.client.primaryLocation.stateProvinceCode || this.vm.client.primaryLocation.stateProvinceCode === "0"));
    }

    public isLoaded(): boolean {
        return true;
    }

    public markAsTouched(): void {
        markFormGroupControlsTouched(this.stepForm);
        return;
    }

    public dateFocus(): void {
        this.isInceptionDateInFocus = true;
    }

    public dateBlur(): void {
        this.isInceptionDateInFocus = false;
    }

    public userProfile: CfcContact;

    constructor(
        public readonly brokerContactService: BrokerContactHttpService,
        private readonly fb: FormBuilder,
        private readonly dropdownService: DropdownService,
        private readonly wordingVersionService: WordingVersionService,
        private readonly dropDownManagerService: DropDownManagerService,
        private readonly modalDialogService: ModalDialogService,
        private readonly userService: UserService,
        private readonly goodsAndServicesTaxService: GoodsAndServicesTaxService,
        private readonly messageService: MessageService,
        private readonly currencyService: CurrencyService,
        private readonly clientClearanceService: ClientClearanceService,
        private readonly clientLatestReferenceHttpService: ClientLatestReferenceHttpService,
        private readonly quoteService: QuoteService,
        private readonly languageService: LanguageService,
        private readonly countryService: CountryService,
        private readonly surplusLineHttpService: SurplusLineHttpService,
    ) {
        super();
    }

    public ngOnInit(): void {
        this.insuranceTypesSubscription = this.dropdownService.getInsuranceTypes().subscribe((val) => {
            this.insuranceTypes = val;
            if (typeof this.vm.insuranceType == "undefined" && !this.vm.insuranceType) this.vm.insuranceType = this.insuranceTypes[0].text;
        });

        this.quoteTypesSubscription = this.dropdownService.getQuoteTypes().subscribe((val) => {
            this.quoteTypes = val;
        });

        this.getAvailableLanguages();

        this.vm.insuranceBasis = this.getInsuranceBasis();
        this.isInsuranceBasisDisabled = !this.isInsuranceBasisFeatureAvailable();
        this.stepForm = this.fb.group({
            assignedContact: [{ value: "", disabled: this.readonly }, [Validators.required, AutocompleteSelectedValidator]],
            currency: [{ value: "", disabled: this.readonly }, [Validators.required, AutocompleteSelectedValidator]],
            surplusLinesBroker: [{ value: "", disabled: this.readonly }],
            localBroker: [{ value: null, disabled: this.readonly }],
            inceptionDate: [{ value: "", disabled: this.readonly }, [Validators.required, DateValidators.date()]],
            policyPeriod: [{ value: "", disabled: this.readonly }, [Validators.required, Validators.min(1), Validators.max(96)]],
            languages: [{ value: "", disabled: this.readonly }],
            wordingVersion: [{ value: "", disabled: this.readonly }, [Validators.required]],
            excessWordingVersion: [{ value: "", disabled: this.readonly }],
            quoteType: [{ value: QuoteType.NewBusiness, disabled: this.readonly }, [Validators.required]],
            expiringPolicyNumber: [this.vm.expiringPolicyNumber],
            insuranceBasis: [{ value: this.vm.insuranceBasis, disabled: this.isInsuranceBasisDisabled || this.readonly }],
        });

        this.formSubscription = this.stepForm.valueChanges.subscribe((data) => this.onValueChanged(data));

        this.quoteTypeSubscription = this.stepForm.controls.quoteType.valueChanges.subscribe((quoteTypeValue: string) => this.quoteTypeChanged(quoteTypeValue));

        this.setViewModelValues();
        this.initialiseDataSources();
        // the code below has been moved to the quote summary component, removed from here once the feacture is active
        if (!this.userService.isFeatureAccessible("heroNewZealandGst")) {
            this.goodsAndServicesTaxService.updateGSTRate(this.vm.inceptionDate);
        }

        this.inceptionDateSubscription = this.stepForm.controls.inceptionDate.valueChanges.subscribe((date) => this.inceptionDateChanged(date));

        if (!this.vm.product) {
            setTimeout(() => this.openProductSelectorDialog(), 0);
        }

        this.userService.getData().subscribe((user) => {
            this.userProfile = user;
            this.checkLocationAuthority();
        });
        this.messageClientLatestReference$.subscribe((e) => this.triggerNextMessage(e));
    }

    public isBrokerEditingAvailable() {
        return this.vm.state === -1 && this.vm.quoteUid !== null && this.userService.isFeatureAccessible("changeBrokerOnQuote");
    }

    public ngOnDestroy(): void {
        if (this.insuranceTypesSubscription) {
            this.insuranceTypesSubscription.unsubscribe();
        }
        if (this.quoteTypesSubscription) {
            this.quoteTypesSubscription.unsubscribe();
        }
        if (this.languageSubscription) {
            this.languageSubscription.unsubscribe();
        }
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
        if (this.wordingVersionSubscription) {
            this.wordingVersionSubscription.unsubscribe();
        }
        if (this.excessWordingVersionSubscription) {
            this.excessWordingVersionSubscription.unsubscribe();
        }
        if (this.inceptionDateSubscription) {
            this.inceptionDateSubscription.unsubscribe();
        }
        if (this.quoteTypeSubscription) {
            this.quoteTypeSubscription.unsubscribe();
        }
        if (this.sLBrokerSubscription) {
            this.sLBrokerSubscription.unsubscribe();
        }
        if (this.localBrokerSubscription) {
            this.localBrokerSubscription.unsubscribe();
        }

        this._destroyed$.next();
        this._destroyed$.complete();

        super.ngOnDestroy();
    }

    public initialiseDataSources() {
        this.currencies = this.dropdownService.getCurrencies();
        this.countries = this.dropdownService.getCountries();
        this.cfccontacts = this.dropdownService.getCfcContacts();
        this.setInitialise();
    }

    public setViewModelValues() {
        if (this.userService.isFeatureAccessible("heroNewZealandGst")) {
            if (!this.vm.insuredLocation || this.vm.insuredLocation.clientLocationId !== this.vm.clientLocation.clientLocationId) {
                this.vm.insuredLocation = this.vm.clientLocation;
                this.quoteService.setPropertyValue("insuredLocation", this.vm.clientLocation);
            }
        } else {
            this.vm.insuredLocation = this.vm.clientLocation;
        }


        if (this.vm.quoteType !== QuoteType.Renewal) {
            this.stepForm.controls.surplusLinesBroker
                .setValue(this.vm.surplusLineBroker ?? null, { emitEvent: false });
        } else {
            const policyNumber = this.vm?.expiringPolicyNumber;

            if (policyNumber?.trim()) {

                this.surplusLineHttpService
                    .resolveForRenewal(policyNumber)
                    .pipe(first())
                    .subscribe({
                        next: (resolvedBroker) => {
                            if (resolvedBroker) {
                                this.vm.surplusLineBroker = resolvedBroker;

                                this.stepForm.controls.surplusLinesBroker
                                    .setValue(resolvedBroker, { emitEvent: false });

                            } else {
                                this.vm.surplusLineBroker = null;
                                this.stepForm.controls.surplusLinesBroker
                                    .setValue(null, { emitEvent: false });
                            }
                        },
                        error: (err) => {
                            console.error('[SL] Error calling resolveForRenewal:', err);
                        }
                    });
            } else {
                console.warn('[SL] No policyNumber defined — skipping renewal resolution.');
            }
        }

        this.stepForm.patchValue({
            assignedContact: this.dropDownManagerService.setDropDownItem<CfcContact>(
                this.vm.assignedContact,
                this.dropDownManagerService.setAssignedContactDropDownItem
            ),
            currency: this.dropDownManagerService.setDropDownItem<Currency>(this.vm.currency, this.dropDownManagerService.setCurrencyDropDownItem),
            inceptionDate: moment(this.vm.inceptionDate),
            policyPeriod: this.vm.policyPeriod,
            language: this.vm.languageId,
            wordingVersion: this.vm.wordingVersionId,
            localBroker: this.dropDownManagerService.setValueToDropDownObject(this.vm.localBroker),
            quoteType: this.vm.quoteType,
            expiringPolicyNumber: this.vm.expiringPolicyNumber,
            insuranceBasis: this.vm.insuranceBasis,
            //surplusLinesBroker: this.vm.surplusLineBroker, dont set the SLBroker, look at the resolver above
        });

        this.setAddressModalData();
    }

    private getAvailableLanguages() {
        const hasCountryAndProductData = this.vm.client && this.vm.product && this.vm.client.primaryLocation.country.isoCode && this.vm.product.productName;
        if (hasCountryAndProductData) {
            this.languageService
                .getLanguageByCountryIsoCodeAndProductCode(this.vm.client.primaryLocation.country.isoCode, this.vm.product.productName)
                .pipe(takeUntil(this.destroyed$))
                .subscribe(
                    (languageList) => {
                        this.languages = this.languageService.mapLanguageToDropDownItem(languageList);
                        this.getAvailableWordingVersion();
                    },
                    (error) => {
                        if (error.status != 404) {
                            this.languageService._languageList.next(null);
                            console.log(error);
                        } else {
                            this.languageService._languageList.next([]);
                        }
                    }
                );
        }
    }

    private getAvailableWordingVersion() {
        if (
            this.vm &&
            this.vm.product &&
            (this.vm.clientLocation || this.vm.client.primaryLocation) &&
            this.vm.brokerTeam &&
            this.vm.brokerTeam.broker &&
            this.vm.languageId
        ) {
            const self = this;
            if (this.modalModel.client && this.modalModel.client.primaryLocation.country) {
                this.userService.countryIsoCode = this.modalModel.client.primaryLocation.country.isoCode;
            } else if (this.vm.insuredLocation && this.vm.insuredLocation.country) {
                this.userService.countryIsoCode = this.vm.insuredLocation.country.isoCode;
            } else {
                this.userService.countryIsoCode = this.vm.client.primaryLocation.country.isoCode;
            }

            let languageCode = "en";

            languageCode = this.languageService.getLanguageById(this.vm.languageId) ? this.languageService.getLanguageById(this.vm.languageId).isoCode : null;

            this.resetWordingVersionValidators(this.vm.insuranceBasis);

            if (this.isInsuranceBasisDisabled == false && this.vm.insuranceBasis == InsuranceBasis.Excess) {
                this.excessWordingVersionSubscription = this.wordingVersionService
                    .getExcessWordingVersions(this.vm.product.productName, this.userService.countryIsoCode, languageCode)
                    .subscribe(
                        (val) => {
                            let oldWordingVersion = -1;
                            if (self.vm && self.vm.excessWordingVersionId) {
                                oldWordingVersion = this.vm.excessWordingVersionId;
                            }

                            self.excessWordingVersions = val;
                            const wordingIds = val.map((i) => Number(i.value));

                            if (!wordingIds.some((i) => i === oldWordingVersion)) {
                                if (wordingIds.length > 0) {
                                    self.vm.excessWordingVersionId = Math.max(...wordingIds);
                                    self.vm.wordingVersionId = parseInt(val.map((i) => i.hidden));
                                } else {
                                    self.vm.excessWordingVersionId = null;
                                    self.vm.wordingVersionId = null;
                                }

                                this.vm.reAutoSelectAllCoverages = true;
                                this.vm.shouldRemoveUnapprovedSubjectivities = true;
                            }
                        },
                        (err) => {
                            self.excessWordingVersions = new Array<DropDownItem>();
                        }
                    );
            } else {
                this.wordingVersionSubscription = this.wordingVersionService
                    .getWordingVersions(this.vm.product.productName, this.userService.countryIsoCode, languageCode)
                    .subscribe(
                        (val) => {
                            // if no wording version currently or current one is not in new list we need to go to the last one
                            let oldWordingVersion = -1;
                            if (self.vm.insuranceBasis !== InsuranceBasis.Excess) {
                                self.vm.excessWordingVersionId = 0;
                            }
                            if (self.vm && self.vm.wordingVersionId) {
                                oldWordingVersion = this.vm.wordingVersionId;
                            }

                            self.wordingVersions = val;
                            const wordingIds = val.map((i) => Number(i.value));

                            if (!wordingIds.some((i) => i === oldWordingVersion)) {
                                if (wordingIds.length > 0) {
                                    self.vm.wordingVersionId = Math.max(...wordingIds);
                                } else {
                                    self.vm.wordingVersionId = null;
                                }

                                this.vm.reAutoSelectAllCoverages = true;
                                this.vm.shouldRemoveUnapprovedSubjectivities = true;
                            }
                        },
                        (err) => {
                            self.wordingVersions = new Array<DropDownItem>();
                        }
                    );
            }
        }
    }

    // TODO: binding should work for this, but currently does not
    private saveToModel(data?: any) {
        //resetting of form control validators is causing an earlier valueChanges being triggered
        //and then the `data` here wiping out the loaded vm data.
        //I can't think of a better way to prevent this right now.
        if (!data.assignedContact || data.assignedContact == "") {
            return;
        }

        this.vm.assignedContact = this.dropDownManagerService.setObjectFromDropDownItem<CfcContact>(
            data.assignedContact,
            this.dropDownManagerService.setAssignedContactFromDropDownItem
        );
        this.vm.assignedContactId = this.vm.assignedContact ? this.vm.assignedContact.cfcContactId : 0;

        this.vm.currency = this.dropDownManagerService.setObjectFromDropDownItem<Currency>(data.currency, this.dropDownManagerService.setCurrencyFromDropDownItem);

        if (this.vm.currency) {
            this.currencyService.getCurrencyRateByIsoCode(this.vm.currency.isoCode).subscribe((currencyRate) => {
                this.vm.currency.rate = currencyRate;
            });
        }

        this.vm.currencyId = this.vm.currency ? this.vm.currency.id : 0;


        if (this.stepForm.get('surplusLinesBroker')?.dirty) {
            this.vm.surplusLineBroker = data.surplusLinesBroker;
        }


        if (this.userService.isFeatureAccessible("heroNewZealandGst")) {
            const inceptionDate = moment.isMoment(data.inceptionDate) ? data.inceptionDate.toDate() : null;
            if (inceptionDate && inceptionDate.toString() !== this.vm.inceptionDate.toString()) {
                this.vm.inceptionDate = inceptionDate;
                this.quoteService.setPropertyValue("inceptionDate", inceptionDate);
            }
        } else {
            if (moment.isMoment(data.inceptionDate)) {
                this.vm.inceptionDate = data.inceptionDate.toDate();
            } else {
                this.vm.inceptionDate = null;
            }
        }

        this.vm.localBroker = data.localBroker;
        this.vm.policyPeriod = data.policyPeriod;
        this.vm.quoteType = data.quoteType;
        this.vm.expiringPolicyNumber = data.expiringPolicyNumber;

        const insuredLocation: ClientLocation = this.vm.client && this.vm.client.primaryLocation ? this.vm.client.primaryLocation : this.vm.clientLocation;

        if (this.userService.isFeatureAccessible("heroNewZealandGst")) {
            if (!this.vm.insuredLocation || this.vm.insuredLocation.clientLocationId !== insuredLocation.clientLocationId) {
                this.vm.insuredLocation = insuredLocation;
                this.quoteService.setPropertyValue("insuredLocation", insuredLocation);
            }
        } else {
            this.vm.insuredLocation = insuredLocation;
        }

        if (this.addressValueChanged) {
            this.addressValueChanged = false;
            this.onAddressChanged.emit();
        }
    }

    public onValueChanged(data?: any) {
        if (!this.stepForm || this.vm.state !== QuoteState.InProgress) {
            return;
        }

        const previousExpiringPolicyNumberValue = Object.assign({}, this.vm).expiringPolicyNumber;

        this.saveToModel(data);

        if (previousExpiringPolicyNumberValue !== this.vm.expiringPolicyNumber) {
            this.onExpiringPolicyNumberChanged.emit();
        }

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

    // Address Client Dialog
    public openClientAddressDialog() {
        this.modalDialogService.openDialog<ClientAddressModal, AddressClientLocationModal>(
            ClientAddressModal,
            ModalConfig.clientAddressModal.matDialogConfig,
            (obj) => {
                this.modalModel.dbOperation = DBOperation.view;
                obj.dialogModel = this.modalModel;
                obj.readOnly = this.readonly;
            },
            (result: AddressClientLocationModal) => this.onCloseClientAddressDialog(result),
            (obj) => obj.onChange.subscribe(() => this.checkAddressChanged())
        );
    }

    private onCloseClientAddressDialog(result: AddressClientLocationModal) {
        setTimeout(() => {
            this.modalModel = result;
            if (this.modalModel) {
                if (this.modalModel.dbOperation === DBOperation.create || this.modalModel.dbOperation === DBOperation.update) {
                    this.openManageClientAddressDialog();
                } else if (this.modalModel.dbOperation === DBOperation.viewMap) {
                    this.openClientAddressMapDialog(this.modalModel.locationId);
                }
            }
        }, 5);
    }

    // Address Map Client Dialog
    public openClientAddressMapDialog(locationId: number) {
        this.modalDialogService.openDialog<AddressMapViewModal, AddressClientLocationModal>(
            AddressMapViewModal,
            ModalConfig.clientAddressMap.matDialogConfig,
            (obj) => {
                this.modalModel.dbOperation = DBOperation.viewMap;
                this.modalModel.locationId = locationId;
                this.modalModel.client = this.vm.client;

                obj.dialogModel = this.modalModel;
                obj.readOnly = this.readonly;
            },
            (result: AddressClientLocationModal) => this.onCloseClientAddressMapDialog(result)
        );
    }

    private onCloseClientAddressMapDialog(result: AddressClientLocationModal) {
        if (result) {
            if (result.dbOperation === DBOperation.view) {
                setTimeout(() => this.openClientAddressDialog(), 5);
            }
        }
    }

    // Address Manage(Add/Edit) Client Dialog
    public openManageClientAddressDialog() {
        if (this.readonly) {
            return;
        }
        this.modalDialogService.openDialog<ClientManageAddressModal, AddressClientLocationModal>(
            ClientManageAddressModal,
            ModalConfig.clientManageAddressModal.matDialogConfig,
            (obj) => {
                obj.dialogModel = this.modalModel;
            },
            () => this.onCloseManageClientAddressDialog()
        );
    }

    public onCloseManageClientAddressDialog() {
        this.modalModel.dbOperation = DBOperation.view;
        setTimeout(() => this.openClientAddressDialog(), 5);
    }

    // Product Dialog
    public openProductSelectorDialog() {
        if (this.readonly) {
            return;
        }
        const config: MatDialogConfig = {
            hasBackdrop: true,
            width: "680px",
        };

        this.modalDialogService.openDialog<ProductSelectorModal, Product>(
            ProductSelectorModal,
            config,
            (obj) => {
                obj.isOutsideProductSelected = this.vm.product && this.vm.product.productId > 0;
            },
            (newProduct: Product) => this.onCloseProductSelectorDialog(newProduct)
        );
        this.disableSaveButton();
    }

    public onCloseProductSelectorDialog(newProduct: Product) {
        if (newProduct && (!this.vm.product || newProduct.productId !== this.vm.product.productId)) {
            this.resetQuoteForNewProduct(this.vm);
            this.vm.product = newProduct;

            this.getAvailableLanguages();

            this.messageClientLatestReference$.next(MessageCategory.ClientLatestReference);
        }
    }

    public openBrokerSelectorDialog() {
        const config: MatDialogConfig = {
            hasBackdrop: true,
            panelClass: "broker-selector-modal",
            height: "auto",
            width: "700px",
            disableClose: false,
        };

        this.modalDialogService.openDialog<BrokerSelectorModalComponent, EnquirySearchResult>(
            BrokerSelectorModalComponent,
            config,
            (obj) => {
                obj.clientId = this.vm.client.id;
            },
            (selectedEnquirySearchResult) => {
                if (selectedEnquirySearchResult) {
                    this.setBrokerDetails(selectedEnquirySearchResult);
                }
            }
        );
    }

    public setBrokerDetails(selectedEnquirySearchResult: EnquirySearchResult) {
        this.brokerContactService.getBrokerContact(selectedEnquirySearchResult.brokerContactId, true).subscribe((brokerDetails) => {
            this.mapBrokerDetails(brokerDetails);
            this.vm.enquiryId = selectedEnquirySearchResult.enquiryId;
            this.vm.enquiryUid = selectedEnquirySearchResult.enquiryUid;
            this.vm.surplusLineBroker = null;
            this.vm.localBroker = null;
            this.quoteService.setPropertyValue("commissionInformation", null);
            this.vm.assignedContact = this.userProfile;
            this.vm.assignedContactId = this.userProfile.cfcContactId;
            this.setViewModelValues();
            this.messageClientLatestReference$.next(MessageCategory.ClientLatestReference);
        });
    }

    private mapBrokerDetails(brokerDetails: BrokerInformationResponse): void {
        this.vm.brokerContact = {
            email: brokerDetails.brokerContact.email,
            firstName: brokerDetails.brokerContact.firstName,
            lastName: brokerDetails.brokerContact.lastName,
            id: brokerDetails.brokerContact.id,
        } as BrokerContact;

        let brokerCountry = {
            countryId: brokerDetails.brokerCompany.country.id,
            isoCode: brokerDetails.brokerCompany.country.isoCode,
        } as Country;

        let brokerCompany = {
            companyName: brokerDetails.brokerCompany.name,
            brokerId: brokerDetails.brokerCompany.id,
            city: brokerDetails.brokerCompany.city,
            country: brokerCountry,
            brokerGroupId: brokerDetails.brokerGroup.id,
        } as Broker;

        this.vm.brokerTeam = { id: brokerDetails.brokerTeam.id, name: brokerDetails.brokerTeam.name, broker: brokerCompany } as BrokerTeam;
    }

    public setAddressModalData(): void {
        if (!this.modalModel) {
            this.modalModel = new AddressClientLocationModal();
        }

        this.modalModel.dbOperation = DBOperation.noAction;

        if (this.vm.clientLocation) {
            this.modalModel.defaultLocation = this.vm.clientLocation.country;
        }

        if (!this.modalModel.client) {
            this.modalModel.client = this.vm.client;
        }
    }

    public addressChanged(country: Country, state: string) {
        if (!country) {
            return;
        }
        this.buttonStatus = {
            canSaveAfterRecalculate: false,
            allowRecalculate: false,
        };

        if (!this.userService.isFeatureAccessible("heroNewZealandGst")) {
            this.goodsAndServicesTaxService.updateGSTRate(this.vm.inceptionDate);
        }

        this.dropdownService
            .getCurrencyByCountryId(country.countryId)
            .pipe(first())
            .subscribe((val) => {
                this.stepForm.patchValue({ currency: val });
            });

        if (this.modalModel) {
            this.modalModel.defaultLocation = country;

            this.setChange();

            this.getAvailableLanguages();
        }
        this.checkLocationAuthority();

        this.messageClientLatestReference$.next(MessageCategory.ClientLatestReference);
    }

    public currencyChange(currency: DropDownItem) {
        this.setChange();
    }

    public languageChange(language: DropDownItem) {
        this.disableSaveButton();
        this.getAvailableWordingVersion();
    }

    public wordingVersionChange(wording: DropDownItem) {
        this.vm.reAutoSelectAllCoverages = true;
        this.vm.shouldRemoveUnapprovedSubjectivities = true;
        this.disableSaveButton();
    }

    public policyPeriodChanged() {
        const inceptionDate = moment(this.stepForm.value.inceptionDate);
        this.updateExpiryDate(inceptionDate);

        this.setChange();
    }

    public inceptionDateChanged(date: moment.Moment) {
        const inceptionDate = date ? date : moment(this.stepForm.value.inceptionDate);
        this.updateExpiryDate(inceptionDate);
        if (!this.userService.isFeatureAccessible("heroNewZealandGst")) {
            this.goodsAndServicesTaxService.updateGSTRate(inceptionDate.toDate());
        }
        this.setChange();
    }

    public insuranceBasisChanged(insuranceBasis: any) {
        this.vm.insuranceBasis = parseInt(insuranceBasis.target.value);
        this.getAvailableWordingVersion();
        this.disableSaveButton();
    }

    private resetWordingVersionValidators(insuranceBasis: InsuranceBasis) {
        if (insuranceBasis === InsuranceBasis.Primary) {
            const currentWordingVersionControl = this.stepForm.get("wordingVersion");
            const updatedWordingVersionControl = new FormControl(currentWordingVersionControl.value, [Validators.required]);
            this.stepForm.setControl("wordingVersion", updatedWordingVersionControl);

            const currentExcessWordingVersionControl = this.stepForm.get("excessWordingVersion");
            const updatedExcessWordingVersionControl = new FormControl(currentExcessWordingVersionControl.value, []);
            this.stepForm.setControl("excessWordingVersion", updatedExcessWordingVersionControl);
        } else if (insuranceBasis === InsuranceBasis.Excess) {
            const currentWordingVersionControl = this.stepForm.get("wordingVersion");
            const updatedWordingVersionControl = new FormControl(currentWordingVersionControl.value, []);
            this.stepForm.setControl("wordingVersion", updatedWordingVersionControl);

            const currentExcessWordingVersionControl = this.stepForm.get("excessWordingVersion");
            const updatedExcessWordingVersionControl = new FormControl(currentExcessWordingVersionControl.value, [Validators.required]);
            this.stepForm.setControl("excessWordingVersion", updatedExcessWordingVersionControl);
        }
    }

    public insuranceTypeChange(insuranceType: any) {
        this.vm.insuranceTypeId = parseInt(insuranceType.target.value);
        this.vm.insuranceType = insuranceType.target.options[insuranceType.target.options.selectedIndex].text;
        this.disableSaveButton();
    }

    private quoteTypeChanged(quoteTypeValue: QuoteType) {
        let isNewType = false;
        if (quoteTypeValue === QuoteType.Renewal) {
            this.stepForm.controls.expiringPolicyNumber.setValidators([Validators.required]);
        } else {
            this.stepForm.controls.expiringPolicyNumber.clearValidators();
        }
        // this condition should be in front of the updatevalue as that will trigger the value change and the model to be updated
        if (quoteTypeValue !== this.vm.quoteType) {
            isNewType = true;
        }
        this.stepForm.controls.expiringPolicyNumber.updateValueAndValidity();
        if (isNewType) {
            this.disableSaveButton();
        }
        this.onQuoteTypeChanged.emit();
    }

    public displayExpiringPolicyNumber() {
        return this.stepForm.controls.quoteType.value === QuoteType.Renewal;
    }

    public displayWordingVersionDropdown() {
        return this.vm.insuranceBasis !== InsuranceBasis.Excess;
    }

    public displayExcessWordingVersionDropdown() {
        return this.vm.insuranceBasis === InsuranceBasis.Excess;
    }

    public updateExpiryDate(date: moment.Moment) {
        if (!date || typeof date.isValid !== "function" || !date.isValid()) {
            return;
        }
        const inceptionDate = date.clone();
        const policyPeriod = this.stepForm.value.policyPeriod;
        const expirationdate = inceptionDate.add(policyPeriod, "months");

        this.vm.expiryDate = expirationdate.toDate();
    }

    public get showSurplusLinesBroker(): boolean {
        if (this.vm && isUnitedStates(this.vm.insuredLocation) && !isAdmitted(this.vm.product)) {
            this.addSubscription(this.sLBrokerSubscription, this.stepForm.controls.surplusLinesBroker);
            return true;
        }

        return false;
    }

    public get isLocalBrokerVisible(): boolean {
        if (this.isCanadianBrokerVisible || this.isEeaBrokerVisible) {
            this.addSubscription(this.localBrokerSubscription, this.stepForm.controls.localBroker);
            return true;
        }

        return false;
    }

    public get isCanadianBrokerVisible(): boolean {
        return isCanada(this.vm.insuredLocation) && !isCanadianBroker(this.vm.brokerTeam);
    }

    public get countryHasState(): boolean {
        return isAustralia(this.vm.client.primaryLocation) || isCanada(this.vm.client.primaryLocation) || isUnitedStates(this.vm.client.primaryLocation);
    }

    public get isEeaBrokerVisible(): boolean {
        return (
            this.userService.isFeatureAccessible("heroEeaBroker") &&
            this.countryService.isEeaCountry(this.vm.insuredLocation.country.isoCode) &&
            !this.countryService.isEeaCountry(this.vm.brokerTeam.broker.country.isoCode)
        );
    }

    public getBrokerTeamName(brokerTeam: BrokerTeam): string {
        return `${brokerTeam.broker.companyName} (${brokerTeam.broker.city}, ${brokerTeam.name})`;
    }

    private checkAddressChanged() {
        if (
            !this.vm.insuredLocation ||
            this.vm.client.primaryLocation.countryId !== this.vm.insuredLocation.countryId ||
            this.vm.client.primaryLocation.stateProvinceCode !== this.vm.insuredLocation.stateProvinceCode
        ) {
            this.addressChanged(this.vm.client.primaryLocation.country, this.vm.client.primaryLocation.stateProvinceCode);
            this.vm.languageId = 1;
            this.quoteService.setPropertyValue("languageId", 1);
            this.addressValueChanged = true;
        }
    }

    private checkLocationAuthority() {
        if (this.vm.client.primaryLocation && this.vm.client.primaryLocation.country) {
            const country = this.vm.client.primaryLocation.country;
            const stateProvinceCode = this.vm.client.primaryLocation.stateProvinceCode;
            this.isAuthorisedLocation = this.userService.isLocationAllowedToBind(country.isoCode, stateProvinceCode);
            this.setWarning(!this.isAuthorisedLocation);
        }
    }

    private checkDataChanged(): boolean {
        if (this.originalQuote && this.vm && this.vm.product && this.originalQuote.product) {
            const retVal =
                this.vm.insuredLocation.countryId !== this.originalQuote.insuredLocation.countryId ||
                this.vm.product.productId !== this.originalQuote.product.productId ||
                this.vm.languageId !== this.originalQuote.languageId ||
                this.vm.quoteType !== this.originalQuote.quoteType ||
                this.vm.expiringPolicyNumber !== this.originalQuote.expiringPolicyNumber ||
                (this.vm.propSignedDate !== null) !== (this.originalQuote.propSignedDate !== null) ||
                this.vm.propSignedDate !== this.originalQuote.propSignedDate;
            return retVal;
        } else {
            return false;
        }
    }

    private resetQuoteForNewProduct(quote: Quote) {
        for (const key in quote) {
            if (!quote.hasOwnProperty(key) || this.excludedQuoteKeysFromReset.indexOf(key) > -1) {
                continue;
            }

            if (typeof quote[key] === "boolean") {
                quote[key] = false;
            } else if (typeof quote[key] === "number") {
                quote[key] = 0;
            } else if (quote[key] instanceof Array) {
                quote[key] = [];
            } else {
                quote[key] = null;
            }
        }
        this.quoteService.updateQuote(quote, false);
    }

    private disableSaveButton(): void {
        this.buttonStatus = {
            canSaveAfterRecalculate: false,
            allowRecalculate: false,
        };
        this.setChange();
    }

    private addSubscription(subscription: Subscription, ctrl: AbstractControl) {
        if (!subscription && ctrl) {
            subscription = ctrl.valueChanges.subscribe(() => this.disableSaveButton());
        }
    }

    private checkClientLatestReference(brokerCompanyId: number, clientId: number, productName: string) {
        if (this.isClientLatestReferenceFeatureAvailable()) {
            let latestQuoteReferenceRequest = this.buildLatestQuoteReferenceRequest(brokerCompanyId, clientId, productName);

            this.clientLatestReferenceHttpService.checkClientLatestReference(latestQuoteReferenceRequest).subscribe(
                (data) => {
                    if (data && data.quoteReference) {
                        this.handleClientLatestReferenceFailedResult(
                            "This client has already been quoted for another broker. Please click <a target='_blank' href='quote/?quoteRef=" +
                            data.quoteReference +
                            "'>here</a> to open that quote in another tab."
                        );
                        this.messageService.clearMessage(MessageCategory.ClientClearance);
                    } else {
                        this.messageService.clearMessage(MessageCategory.ClientLatestReference);
                        this.messageClientLatestReference$.next(MessageCategory.ClientClearance);
                    }
                },
                (error) => {
                    this.handleClientLatestReferenceFailedResult(
                        "An error occurred while performing the client latest reference check. Please check manually before issuing quotes."
                    );
                    console.error(error);
                }
            );
        }
    }

    private triggerNextMessage(messageCategory: MessageCategory) {
        switch (messageCategory) {
            case MessageCategory.ClientLatestReference: {
                this.checkClientLatestReference(this.vm.brokerTeam.broker.brokerId, this.vm.client.id, this.vm.product.productName);
                break;
            }
            case MessageCategory.ClientClearance: {
                this.clientClearanceService.checkClientClearanceForBroker(this.vm.brokerTeam.broker.brokerId, this.vm.client.uid);
                break;
            }
            default: {
                break;
            }
        }
    }

    private isClientLatestReferenceFeatureAvailable() {
        return this.userService.isFeatureAccessible("changeBrokerOnQuote");
    }

    private buildLatestQuoteReferenceRequest(brokerCompanyId: number, clientId: number, productName: string): LatestQuoteReferenceRequest {
        let latestQuoteReferenceRequest = new LatestQuoteReferenceRequest();

        latestQuoteReferenceRequest.excludeBrokerId = brokerCompanyId;
        latestQuoteReferenceRequest.clientId = clientId;
        latestQuoteReferenceRequest.productName = productName;

        return latestQuoteReferenceRequest;
    }

    private handleClientLatestReferenceFailedResult(errorMessage: string) {
        this.messageService.sendMessage(new Message(errorMessage, MessageType.Warning), MessageCategory.ClientLatestReference);
    }

    private isInsuranceBasisFeatureAvailable() {
        return this.userService.isFeatureAccessible("insuranceBasisExcessOption");
    }

    private getInsuranceBasis(): InsuranceBasis {
        return this.vm.excessWordingVersionId > 0 ? InsuranceBasis.Excess : InsuranceBasis.Primary;
    }
}
