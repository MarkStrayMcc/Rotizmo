import { AfterContentInit, AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { DBOperation } from "@app/enums/DBOperations";
import { DropDownTypes } from "@app/enums/DropDownTypes";
import { MessageType } from "@app/enums/MessageType";
import { CfcContact, Client, ClientLocation, DropDownItem, Policy } from "@app/models";
import { AutocompleteRequest } from "@app/models/locationapis.model";
import { Message } from "@app/models/Message";
import { MtaChangeTypeEnum } from "@app/policy/enums/MtaChangeType";
import { AddressChangeMtaRequest } from "@app/policy/models/AddressChangeMtaRequest";
import { MtaSendEmailModalConfig } from "@app/policy/mta/popups/send-email/mta-send-email-modal.config";
import { MtaSendEmailComponent } from "@app/policy/mta/popups/send-email/mta-send-email.component";
import { MtaService } from "@app/policy/services/mta.service";
import { ClientHttpService } from "@app/services/client-http.service";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { DropdownService } from "@app/services/dropdown.service";
import { LocationHttpService } from "@app/services/location-http.service";
import { MessageService } from "@app/services/message.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { UserService } from "@app/services/user.service";
import { DateValidators } from "@app/validators/date.validators";
import { Guid } from "guid-typescript";
import * as moment from "moment";
import { Observable, Subscription } from "rxjs";
import { first } from "rxjs/operators";
import { MtaModalModel } from "../mta-modal.model";
import { MtaSendEmailModel } from "../send-email/mta-send-email.model";

@Component({
    selector: "policy-mta-address-change-modal",
    styleUrls: ["mta-address-change.component.scss"],
    templateUrl: "mta-address-change.component.html",
})
export class MtaAddressChangeComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {

    @ViewChild("ddlPostcode") public ddlPostcode: AutocompleteDropdown;

    public client: Client;
    public location: ClientLocation;
    public dialogModel: MtaModalModel;
    public policy: Policy;

    public postcodeLookup: Observable<any>;
    public countries: Observable<any>;

    public dbFilter: AutocompleteRequest;

    public msgError: string;
    public addressForm: FormGroup;
    public dbOperations: DBOperation;

    public showState: boolean;
    public isSaving = false;

    public countriesWithStates: string[];
    public serachResults: DropDownItem[];

    public objectKeys = Object.keys;
    public mtaChangeTypeEnum = MtaChangeTypeEnum;
    public country: string;

    public formErrors = {
        changeType: "",
        effectiveDate: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        postCode: "",
        city: "",
        stateProvince: "",
    };

    public validationMessages = {
        addressLine1: {
            maxlength: "Cannot be more than 100 characters long",
            required: "Required",
        },
        addressLine2: {
            maxlength: "Cannot be more than 100 characters long",
        },
        addressLine3: {
            maxlength: "Cannot be more than 100 characters long",
        },
        city: {
            required: "Required",
        },
        postCode: {
            required: "Required",
        },
        stateProvince: {
            required: "Required",
            invalidOption: "Please enter a valid state",
        },
    };

    protected sendEmailModalModel: MtaSendEmailModel;

    private formSubscription: Subscription;
    private postCodeSubscription: Subscription;
    private placeDetailsSubscription: Subscription;
    private userProfile: CfcContact;
    private mtaId: Guid;

    constructor(public mtaHttpService: MtaService,
        public userService: UserService,
        public dropdownService: DropdownService,
        public locationHttpService: LocationHttpService,
        public dropDownManagerService: DropDownManagerService,
        private formBuilder: FormBuilder,
        private clientService: ClientHttpService,
        private messageService: MessageService,
        private modalDialogService: ModalDialogService) { }

    public ngOnInit() {
        this.userProfile = this.userService.getUser();
        this.showState = false;
        this.countriesWithStates = ["CA", "AU", "US"];

        this.addressForm = this.formBuilder.group({
            changeType: [""],
            effectiveDate: [moment(), [Validators.required, DateValidators.date()]],
            addressLine1: ["", [Validators.required, Validators.maxLength(100)]],
            addressLine2: ["", [Validators.maxLength(100)]],
            addressLine3: ["", [Validators.maxLength(100)]],
            city: ["", [Validators.required, Validators.maxLength(30)]],
            postCode: ["", [Validators.maxLength(10)]],
            stateProvince: ["", [Validators.maxLength(30)]],
            county: [""]
        });
    }

    public initialiseData() {
        this.dbFilter = new AutocompleteRequest();
        this.postcodeLookup = this.dropdownService.getAutocompleteAddresses(this.dbFilter);
        this.clientService.getClient(this.dialogModel.policy.reference).pipe(first()).subscribe((client: Client) => {
            this.country = client.primaryLocation.country.name;
        },
            (error) => { console.log(error); }
        );

        this.subscribeActions();
    }

    public ngAfterViewInit() { }

    public ngAfterContentInit() {
        this.initialiseData();
        if (this.ddlPostcode) {
            this.ddlPostcode.type = DropDownTypes.dynamic;
        }
    }

    public isPolicyReissue() {
        return this.addressForm.controls.changeType.value === "PolicyReissue";
    }

    public ngOnDestroy(): void {
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }

        if (this.postCodeSubscription) {
            this.postCodeSubscription.unsubscribe();
        }

        if (this.placeDetailsSubscription) {
            this.placeDetailsSubscription.unsubscribe();
        }
    }

    public onValueChanged(): boolean {
        let retVal = true;
        if (!this.addressForm) { return; }
        const form = this.addressForm;

        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                this.formErrors[field] = "";
                const control = form.get(field);

                if (control && !control.valid && control.dirty && (control.dirty || control.touched)) {
                    const messages = this.validationMessages[field];
                    for (const key in control.errors) {
                        if (messages[key]) {
                            this.formErrors[field] += messages[key] + " ";
                            retVal = false;
                        }
                    }
                }
            }
        }

        return retVal;
    }

    public onSubmit(formData: any, event: any) {
        this.messageService.clearAllMessages();
        if (!event) {
            event.preventDefault();
        }

        if (!this.validateFormFields()) {
            return false;
        }

        const addressChangeMtaRequest: AddressChangeMtaRequest = this.mtaAddressChangeRequestBuilder(formData.value);
        this.isSaving = true;

        this.mtaHttpService.AddressChange(addressChangeMtaRequest)
            .subscribe(
                (data) => {
                    if (data.mtaId) {
                        this.mtaId = Guid.parse(data.mtaId);
                        this.addressForm.disable();
                    } else {
                        this.handleError();
                    }
                    this.isSaving = false;
                },
                (error) => {
                    if (error.error?.validationMessages && error.error.validationMessages.length > 0) {
                        this.handleError(error.error.validationMessages);
                    } else {
                        this.handleError();
                    }
                    this.isSaving = false;
                }
            );
    }

    public validateFormFields(): boolean {
        this.markFormGroupAsTouched(this.addressForm);
        if (!this.onValueChanged()) {
            return false;
        }
        return true;
    }

    public subscribeActions() {
        this.formSubscription = this.addressForm.valueChanges.subscribe((data) => {
            this.onValueChanged()
        });
    }

    public isSavingOrSaved(): boolean {
        return this.isSaving || this.isSaved();
    }

    public isSaved(): boolean {
        return this.mtaId && !this.mtaId.isEmpty();
    }

    public openAddressChangeSendEmailModal() {
        this.sendEmailModalModel = {
            mtaId: this.mtaId,
            policy: this.dialogModel.policy
        };
        this.modalDialogService.openDialog<MtaSendEmailComponent, MtaSendEmailModel>
            (MtaSendEmailComponent, MtaSendEmailModalConfig.dialog.matDialogConfig,
                modalConfig => {
                    modalConfig.user = this.userProfile;
                    modalConfig.dialogModel = this.sendEmailModalModel;
                    modalConfig.readOnly = false;
                },
                (result: any) => this.onCloseClientSendEmailDialog(result)
            );
    }

    private mtaAddressChangeRequestBuilder(addressChangeMtaRequest: AddressChangeMtaRequest): AddressChangeMtaRequest {
        addressChangeMtaRequest.cfcUserId = this.userProfile.cfcContactUid;
        addressChangeMtaRequest.policyNumber = this.dialogModel.policy.reference;
        addressChangeMtaRequest.effectiveDate = moment(this.addressForm.get("effectiveDate").value)
            .format("YYYY-MM-DDTHH:mm:ss")
            .toString();
        return addressChangeMtaRequest;
    }

    private markFormGroupAsTouched(formGroup: FormGroup) {
        (Object as any).values(formGroup.controls).forEach((control) => {
            control.markAsTouched();
            control.markAsDirty();

            if (control.controls) {
                control.controls.forEach((c) => this.markFormGroupAsTouched(c));
            }
        });
    }

    private handleError(errorList: string[] = null) {
        const message = new Message();
        message.type = MessageType.Error;

        if (errorList != null && errorList.length === 1) {
            message.text = errorList[0];
        } else if (errorList != null && errorList.length > 1) {
            message.messageList = errorList;
        } else {
            message.text = "An error occurred while submitting your change. Please contact IT Support.";
        }

        this.messageService.sendMessage(message);
    }

    private onCloseClientSendEmailDialog(result: any) {
        setTimeout(() => {
            this.sendEmailModalModel = result;
        });
    }
}
