import { Component, forwardRef, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { Message, MessageType, Quote, SurplusLine } from "@app/models";
import { SurplusLinesLicense } from "@app/quote/models/SurplusLinesLicense";
import { SurplusLinesLicenseResponse } from '@app/quote/models/SurplusLinesLicenseResponse';
import { ModalConfig } from "@app/quote/popups/modal.config";
import { SurplusLinesBrokerModal } from "@app/quote/popups/surplus-lines-broker-modal/surplus-lines-broker-modal.component";
import { QuoteService } from "@app/quote/services/quote.service";
import { SurplusLinesLicenseHttpService } from "@app/quote/services/surplus-lines-license-http.service";
import { SurplusLinesLicenseService } from "@app/quote/services/surplus-lines-license.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { AutocompleteValidator } from "@app/validators/autocomplete-selected.validator";
import { BehaviorSubject, Subscription } from "rxjs";
import { first, map } from "rxjs/operators";

@Component({
    selector: "surplus-line-selector",
    templateUrl: "./surplus-line-selector.component.html",
    styleUrls: ["./surplus-line-selector.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SurplusLineSelectorComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => SurplusLineSelectorComponent),
            multi: true
        }]
})
export class SurplusLineSelectorComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges, Validator {
    @Input() public state: string;
    @Input() public brokerTeamId: number;
    @Input() public enableNewSurplusLines: boolean;

    public surplusLines$: BehaviorSubject<SurplusLine[]> = new BehaviorSubject<SurplusLine[]>([]);
    public surplusLineAddressToolTip: string;

    public control: FormControl = new FormControl();

    protected surplusLine: SurplusLine[];
    protected surplusLinesLicense: SurplusLinesLicense[] = [];

    private onChangeHandler: (value: SurplusLine) => void = (_: any) => { };
    private onTouchedHandler: () => void = () => { };
    private onValidatorChangeHandler: () => void = () => { };
    private valueChangeSubscription: Subscription;
    private statusChangeSubscription: Subscription;

    constructor(
        private readonly surplusLineHttpService: SurplusLinesLicenseHttpService,
        private readonly surplusLinesLicenseService: SurplusLinesLicenseService,
        private readonly modalDialogService: ModalDialogService,
        private readonly messageService: MessageService,
        private readonly quoteService: QuoteService,
        private readonly userService: UserService) {
        this.control.setValidators(AutocompleteValidator<SurplusLine>(x => x.id));
    }

    public ngOnChanges(): void {
        const quote: Quote = this.quoteService.getQuoteReference();
        this.surplusLineHttpService
                .getSurplusLinesByBrokerTeamIdAndStateIsoCode(this.brokerTeamId, this.state)
                .pipe(first())
                .subscribe(surplusLines => this.surplusLinesHandler(surplusLines));
    }

    public ngOnInit(): void {
        this.valueChangeSubscription = this.control.valueChanges.pipe(map(surplusLine => surplusLine === "" ? null : surplusLine)).subscribe(surplusLine => this.valueChangeHandler(surplusLine));
        this.statusChangeSubscription = this.control.statusChanges.subscribe(() => this.onValidatorChangeHandler());
    }

    public ngOnDestroy(): void {
        this.valueChangeSubscription.unsubscribe();
        this.statusChangeSubscription.unsubscribe();
    }

    public writeValue(value: SurplusLine): void {
        this.control.setValue(value);
    }

    public registerOnChange(fn: (value: SurplusLine) => void): void {
        this.onChangeHandler = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouchedHandler = fn;
    }

    public registerOnValidatorChange?(fn: () => void): void {
        this.onValidatorChangeHandler = fn;
    }

    public setDisabledState?(isDisabled: boolean): void {
        if (isDisabled) {
            this.control.disable();
        } else {
            this.control.enable();
        }
    }

    public validate(): ValidationErrors {
        return this.control.errors;
    }

    public surplusLineDisplay(surplusLine: SurplusLine) {
        if (!surplusLine) {
            return "";
        }

        return `${surplusLine.licenseNumber.trim()} (${surplusLine.brokerName}, ${surplusLine.contactName})`;
    }

    public autocompleteTouchHandler = () => this.onTouchedHandler();

    public openSurplusLinesBrokerDialog() {
        if (this.control.disabled) {
            return;
        }

        if (this.userService.isFeatureAccessible("heroSurplusLinesLicense")) {
            this.modalDialogService.openDialog<SurplusLinesBrokerModal, SurplusLinesLicense>(
                SurplusLinesBrokerModal,
                ModalConfig.surplusLinesBrokerModal.matDialogConfig,
                SurplusLinesLicense => SurplusLinesLicense.readOnly = this.control.disabled,
                SurplusLinesLicense => this.onCloseSurplusLinesLicenseModal(SurplusLinesLicense)
            );
        } else {
            this.modalDialogService.openDialog<SurplusLinesBrokerModal, SurplusLine>(
                SurplusLinesBrokerModal,
                ModalConfig.surplusLinesBrokerModal.matDialogConfig,
                surplusLine => surplusLine.readOnly = this.control.disabled,
                surplusLine => this.onCloseSurplusLinesBrokerModal(surplusLine)
            );
        }
    }

    private hasBrokerContactEmail(quote: Quote) {
        return quote && quote.brokerContact && quote.brokerContact.email;
    }

    private valueChangeHandler(surplusLine: SurplusLine): void {
        this.onChangeHandler(surplusLine);
        if (surplusLine) {
            this.setSurplusLineAddressToolTipText(surplusLine);
        }
    }

    private setSurplusLineAddressToolTipText(surplusLine) {
        let surplusLineAddressValues;
        if (this.userService.isFeatureAccessible("heroSurplusLinesLicense") && this.surplusLinesLicense) {
            const surplusLinesLicense = this.surplusLinesLicense.find(surplusLineLicense => surplusLine.id === surplusLineLicense.id);
            if (surplusLinesLicense) {
                surplusLineAddressValues = [surplusLine.address1, surplusLine.address2, surplusLine.address3, surplusLinesLicense.licenseStateIsoCode, surplusLine.zip];
            }
        } else {
            surplusLineAddressValues = [surplusLine.address1, surplusLine.address2, surplusLine.address3, surplusLine.stateProvinceCode, surplusLine.zip];
        }
        if (surplusLineAddressValues) {
            this.surplusLineAddressToolTip = surplusLineAddressValues.join(' ');
        }
    }

    private onCloseSurplusLinesLicenseModal(surplusLinesLicense: SurplusLinesLicense) {
        if (!surplusLinesLicense) {
            return;
        }
        this.messageService.clearMessage();
        this.messageService.sendMessage(new Message("Successfully created new surplus lines broker.", MessageType.Info));

        if (surplusLinesLicense.licenseStateIsoCode === this.state) {
            this.surplusLinesLicense.push(surplusLinesLicense);
            const surplusLine = this.surplusLinesLicenseService.mapSurplusLinesLicenseToSuplusLine(surplusLinesLicense);
            const surplusLineList = this.surplusLinesLicenseService.mapSurplusLinesLicenseListToSuplusLineList(this.surplusLinesLicense);
            this.surplusLines$.next(surplusLineList);
            delete surplusLine.surplusLineBrokerUid;
            this.control.setValue(surplusLine);
        }

        this.onTouchedHandler();
    }

    private onCloseSurplusLinesBrokerModal(surplusLine: SurplusLine) {
        if (!surplusLine) {
            return;
        }
        this.messageService.clearMessage();
        this.messageService.sendMessage(new Message("Successfully created new surplus lines broker.", MessageType.Info));

        if (surplusLine.stateProvinceCode === this.state) {
            this.surplusLine.push(surplusLine);
            this.surplusLines$.next(this.surplusLine);
            this.control.setValue(surplusLine);
        }

        this.onTouchedHandler();
    }

    private surplusLinesLicenseHandler(surplusLinesLicense: SurplusLinesLicense[]) {
        const surplusLines = this.surplusLinesLicenseService.mapSurplusLinesLicenseListToSuplusLineList(surplusLinesLicense);
        this.surplusLinesLicense = surplusLinesLicense;
        this.surplusLines$.next(surplusLines);
    }

    private surplusLinesHandler(surplusLines: SurplusLine[]) {
        this.surplusLine = surplusLines;
        this.surplusLines$.next(surplusLines);
    }
}
