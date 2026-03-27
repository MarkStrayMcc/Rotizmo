import { Component, EventEmitter, Output, OnDestroy, OnInit } from "@angular/core";
import { Store, select } from "@ngrx/store";
import { Subscription } from "rxjs";
import * as moment from "moment";
import { BaseStepComponent } from "@app/quote/steps/base-step.component";
import { ButtonStatus } from "@app/quote/view-models/ButtonStatus";
import * as fromBasicInformationStore from "@app/basic-information-store";
import { BasicInformationState } from "@app/basic-information-store";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { Currency, CfcContact, Quote, QuoteState } from "@app/models";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { isCanada, isCanadianBroker, isUnitedStates, isAdmitted, isAustralia } from "@app/helpers";

@Component({
    selector: "app-basic-information-wrapper",
    templateUrl: "./basic-information-wrapper.component.html",
    styleUrls: ["./basic-information-wrapper.component.scss"]
})
export class BasicInformationWrapperComponent extends BaseStepComponent implements OnDestroy, OnInit {

    private isInitializationInProgress = false;

    constructor(
        private store: Store<fromBasicInformationStore.BasicInformationState>,
        private readonly dropDownManagerService: DropDownManagerService,
        private readonly goodsAndServicesTaxService: GoodsAndServicesTaxService
    ) { super(); }

    @Output() public onValid = new EventEmitter<boolean>();
    @Output() public onChange = new EventEmitter<ButtonStatus>();
    @Output() public onInitialise = new EventEmitter();
    @Output() public onLoadCompleted = new EventEmitter();
    @Output() public onWarningChange = new EventEmitter<boolean>();

    private quoteTypeSubscription: Subscription;
    private insuranceTypeSubscription: Subscription;
    private productSubscription: Subscription;
    private wordingsSubscription: Subscription;
    private surplusLineBrokerSubscription: Subscription;
    private localBrokerSubscription: Subscription;
    private assignedContactSubscription: Subscription;
    private languageSubscription: Subscription;
    private wordingVersionSubscription: Subscription;
    private euSubsidiarySubscription: Subscription;
    private expiringPolicyNumberSubscription: Subscription;
    private currencySubscription: Subscription;
    private inceptionDateSubscription: Subscription;
    private policyPeriodSubscription: Subscription;
    private expiryDateSubscription: Subscription;
    private addressSubscription: Subscription;
    private countryAuthoritySubscription: Subscription;

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
        "expiringPolicyNumber"
    ];

    // The following are all required to bridge the gap between the quote component
    // and the basic step component.
    public sendValid(isValid: boolean) {
        this.onValid.emit(isValid);
    }
    public sendChange(status: ButtonStatus) {
        this.onChange.emit(status);
    }
    public sendInitialised() {
        this.onInitialise.emit();
    }
    public sendAddressChanged() {
        this.onValid.emit();
    }
    public sendWarningChange(isValid: boolean) {
        this.onWarningChange.emit(isValid);
    }
    public isLoaded(): boolean {
        return true;
    }
    public isValid(): boolean {
        return true;
    }
    public isDirty(): boolean {
        return false;
    }
    public markAsTouched() {
    }

    public ngOnInit() {
        this.isInitializationInProgress = true;
        this.loadState();
        this.initialiseSelectors();
        this.isInitializationInProgress = false;
    }

    public triggerUpdateQuote() {
        this.store.dispatch(fromBasicInformationStore.updateQuote({ quoteState: this.vm.state }));
    }

    public get showSurplusLinesBroker(): boolean {
        if (this.vm && isUnitedStates(this.vm.insuredLocation) && !isAdmitted(this.vm.product)) {
            return true;
        }

        this.vm.surplusLineBroker = null;
        return false;
    }

    public get showLocalBroker(): boolean {
        if (!this.vm) {
            return false;
        }

        if (!isCanada(this.vm.insuredLocation) || isCanadianBroker(this.vm.brokerTeam)) {
            this.vm.localBroker = null;
            return false;
        }

        return true;
    }

    private loadState() {
        if (!this.vm.insuredLocation) {
            this.vm.insuredLocation = this.vm.clientLocation;
        }

        const stateToLoad: BasicInformationState = {
            formValues: {
                quoteState: this.vm.state,
                client: this.vm.client,
                brokerTeam: this.vm.brokerTeam,
                brokerContact: this.vm.brokerContact,
                surplusLinesBroker: this.vm.surplusLineBroker,
                quoteType: this.vm.quoteType,
                insuranceType: this.vm.insuranceTypeId,
                product: this.vm.product,
                inceptionDate: moment(this.vm.inceptionDate),
                policyPeriod: this.vm.policyPeriod,
                language: this.vm.languageId,
                wordingVersionId: this.vm.wordingVersionId,
                expiryDate: this.vm.expiryDate,
                expiringPolicyNumber: this.vm.expiringPolicyNumber,
                hasEuSubsidiaries: this.vm.client.hasEuSubsidiaries,
                assignedContact: this.dropDownManagerService.setDropDownItem<CfcContact>(
                    this.vm.assignedContact,
                    this.dropDownManagerService.setAssignedContactDropDownItem
                ),
                currency: this.dropDownManagerService.setDropDownItem<Currency>(
                    this.vm.currency,
                    this.dropDownManagerService.setCurrencyDropDownItem
                ),
                localBroker: this.dropDownManagerService.setValueToDropDownObject(
                    this.vm.localBroker
                ),
                address: this.vm.insuredLocation,
            },
            formOptions: {
                readonly: this.readonly,
                showLocalBroker: this.showLocalBroker,
                showSurplusLinesBroker: this.showSurplusLinesBroker,
                currencies: null,
                countries: null,
                cfcContacts: null,
                localBrokers: null,
                insuranceTypes: null,
                quoteTypes: null,
                languages: null,
                wordings: null,
            },
            formValidation: {
        isAuthorisedLocation: false
            }
        };
        this.store.dispatch(fromBasicInformationStore.basicInformationLoad({ stateToLoad }));
    }

    private initialiseSelectors() {
        this.quoteTypeSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationQuoteType))
            .subscribe(quoteType => {
                this.vm.quoteType = quoteType;
                this.disableSaveButton();
            });

        this.insuranceTypeSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationInsuranceType))
            .subscribe(insuranceType => {
                this.vm.insuranceTypeId = insuranceType;
                this.disableSaveButton();
            });

        this.productSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationProduct))
            .subscribe(product => {
                if (product && (!this.vm.product || product.productId !== this.vm.product.productId)) {
                    this.resetQuoteForNewProduct(this.vm);
                    this.vm.product = product;
                    this.disableSaveButton();
                }
            });

        this.wordingsSubscription = this.store.pipe(select(fromBasicInformationStore.selectWordings))
            .subscribe(wordings => {
                const wordingIds = wordings ? wordings.map(i => Number(i.value)) : [];
                const selectedWordingId = this.vm.wordingVersionId;
                if (!wordingIds.some(i => i === selectedWordingId)) {
                    this.vm.reAutoSelectAllCoverages = true;
                    this.vm.shouldRemoveUnapprovedSubjectivities = true;
                }
            });

        this.surplusLineBrokerSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationSurplusLineBroker))
            .subscribe(surplusLineBroker => {
                this.vm.surplusLineBroker = surplusLineBroker;
                this.disableSaveButton();
            });

        this.localBrokerSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationLocalBroker))
            .subscribe(localBroker => {
                this.vm.localBroker = localBroker;
                this.disableSaveButton();
            });

        this.assignedContactSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationAssignedContact))
            .subscribe(assignedContact => {
                this.vm.assignedContact = this.dropDownManagerService.setObjectFromDropDownItem<CfcContact>(assignedContact,
                    this.dropDownManagerService.setAssignedContactFromDropDownItem);
                this.vm.assignedContactId = this.vm.assignedContact ? this.vm.assignedContact.cfcContactId : 0;
                this.disableSaveButton();
            });

        this.languageSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationLanguage))
            .subscribe(language => {
                this.vm.languageId = language;
                this.disableSaveButton();
            });

        this.wordingVersionSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationWordingVersionId))
            .subscribe(wordingVersion => {
                if (this.vm.wordingVersionId !== wordingVersion) {
                    this.vm.reAutoSelectAllCoverages = true;
                    this.vm.shouldRemoveUnapprovedSubjectivities = true;
                    this.vm.wordingVersionId = wordingVersion;
                }

                this.disableSaveButton();
            });

        this.euSubsidiarySubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationHasEuSubsidiary))
            .subscribe(hasEuSubsidiaries => {
                this.vm.client.hasEuSubsidiaries = hasEuSubsidiaries;
                this.disableSaveButton();
            });

        this.expiringPolicyNumberSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationExpiryPolicyNumber))
            .subscribe(expiringPolicyNumber => {
                this.vm.expiringPolicyNumber = expiringPolicyNumber;
                this.disableSaveButton();
            });

        this.currencySubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationCurrency))
            .subscribe(currency => {
                this.vm.currency = this.dropDownManagerService.setObjectFromDropDownItem<Currency>(currency,
                    this.dropDownManagerService.setCurrencyFromDropDownItem);
                this.vm.currencyId = this.vm.currency ? this.vm.currency.id : 0;
                this.disableSaveButton();
            });

        this.inceptionDateSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationInceptionDate))
            .subscribe(inceptionDate => {
                if (moment.isMoment(inceptionDate)) {
                    this.vm.inceptionDate = inceptionDate.toDate();
                } else {
                    this.vm.inceptionDate = null;
                }

                if (this.vm && isAustralia(this.vm.insuredLocation)) {
                    this.goodsAndServicesTaxService.updateGSTRate(inceptionDate.toDate());
                }

                this.disableSaveButton();
            });

        this.policyPeriodSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationPolicyPeriod))
            .subscribe(policyPeriod => {
                this.vm.policyPeriod = policyPeriod;
                this.disableSaveButton();
            });

        this.expiryDateSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationExpiryDate))
            .subscribe(expiryDate => {
                this.vm.expiryDate = expiryDate;
            });

        this.addressSubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationAddress))
            .subscribe(address => {
                this.vm.insuredLocation = (address ? address : this.vm.clientLocation);
                this.vm.client.primaryLocation = this.vm.insuredLocation;
                this.disableSaveButton();
            });

    this.countryAuthoritySubscription = this.store.pipe(select(fromBasicInformationStore.selectBasicInformationIsAuthorisedLocation))
            .subscribe(isAuthorised => {
                this.sendWarningChange(!isAuthorised);
            });
    }

    private resetQuoteForNewProduct(quote: Quote) {
        for (const key in quote) {
            if (
                !quote.hasOwnProperty(key) ||
                this.excludedQuoteKeysFromReset.indexOf(key) > -1
            ) {
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
    }

    private disableSaveButton(): void {
        if (!this.isInitializationInProgress) {
            const buttonStatus = {
                canSaveAfterRecalculate: false,
                allowRecalculate: false
            };

            this.sendChange(this.buttonStatus);
        }
    }

    ngOnDestroy() {
        this.destroySubscription(this.quoteTypeSubscription);
        this.destroySubscription(this.insuranceTypeSubscription);
        this.destroySubscription(this.productSubscription);
        this.destroySubscription(this.wordingsSubscription);
        this.destroySubscription(this.surplusLineBrokerSubscription);
        this.destroySubscription(this.localBrokerSubscription);
        this.destroySubscription(this.assignedContactSubscription);
        this.destroySubscription(this.languageSubscription);
        this.destroySubscription(this.wordingVersionSubscription);
        this.destroySubscription(this.euSubsidiarySubscription);
        this.destroySubscription(this.expiringPolicyNumberSubscription);
        this.destroySubscription(this.currencySubscription);
        this.destroySubscription(this.inceptionDateSubscription);
        this.destroySubscription(this.policyPeriodSubscription);
        this.destroySubscription(this.expiryDateSubscription);
        this.destroySubscription(this.addressSubscription);
        this.destroySubscription(this.countryAuthoritySubscription);
    }

    private destroySubscription(subscription: Subscription) {
        if (subscription) {
            subscription.unsubscribe();
        }
    }
}
