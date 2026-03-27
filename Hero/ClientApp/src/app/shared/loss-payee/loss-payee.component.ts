import { ElementRef, OnDestroy, OnInit, ViewChild, Directive } from "@angular/core";
import { CfcContact } from "@app/models";
import { DropdownService } from "@app/services/dropdown.service";
import { UserService } from "@app/services/user.service";
import { FormButton, FormConfig, FormItem } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Guid } from "guid-typescript";
import { Country } from "@app/models/auto-generated/Country";
import { ListActionType } from "@app/shared/ListActionType";
import { LossPayeeConfigBuilder } from "@app/shared/loss-payee/loss-payee.config-builder";
import { ILossPayeeDetails } from "@app/shared/loss-payee/ILossPayeeDetails";
import { InterestOfEntity } from '../../models/InterestOfEntity';
import { LossPayee } from '../../models/auto-generated/LossPayee';

@Directive()
export abstract class LossPayeeComponent implements OnInit, OnDestroy {
    public isSaveDisabled = true;
    public isSaved = false;
    public userProfile: CfcContact;
    public formModalConfig: FormConfig;
    public lossPayeeForm: FormItem;
    public lossPayeeDetails: ILossPayeeDetails[] = [];
    public addButton: FormButton;
    public countries: any[];
    public actionType: ListActionType;
    public lossPayeeForEditing: LossPayee;

    public addButtonProperty: string = "loss-payee-add";

    @ViewChild("formComponent") formComponent: ElementRef;

    constructor(
        public userService: UserService,
        public formCreatorService: FormCreatorService,
        public dropdownService: DropdownService,
        public lossPayeeConfigBuilder: LossPayeeConfigBuilder
    ) { }

    public ngOnInit() {
        this.userProfile = this.userService.getUser();
        this.formHandler();
        this.dropdownService.getCountries().subscribe((countries) => this.countries = countries);
    }

    public ngOnDestroy() { }

    public formHandler() {
        this.formCreatorService.formInstance.subscribe((form) => {
            if (form && this.lossPayeeForm !== form) {
                this.lossPayeeForm = form;
                this.handleAddButtonsState();
            }
        });
    }

    public addLossPayee() {
        this.actionType = ListActionType.Add;
        this.lossPayeeDetails.map((list) => {
            list.isVisible = false;
        });
        this.formModalConfig = this.lossPayeeConfigBuilder.setConfig(this.countries);
        this.isSaveDisabled = true;
    }

    public editLossPayee(id: Guid) {
        let selectedCountry: Country;
        let interestOfEntity: InterestOfEntity;
        this.lossPayeeDetails.map((list) => {
            if (list.id === id) {
                selectedCountry = this.countries.find(country => country.hidden === list.lossPayee.countryIsoCode) as Country;
                interestOfEntity = list.lossPayee.interestOfEntity as InterestOfEntity;
                list.isVisible = true;
            } else {
                list.isVisible = false;
            }
        });
        this.actionType = ListActionType.Edit;
        this.formModalConfig = this.lossPayeeConfigBuilder.setConfig(this.countries, selectedCountry);
        this.setInterestOfEntity(interestOfEntity);
        this.lossPayeeForEditing = this.getLossPayeeForEditing(id);
        this.isSaveDisabled = true;
    }

    private setInterestOfEntity(interestOfEntity: InterestOfEntity) {
        const interestOfEntityField = this.formModalConfig.groups[0].fields.find(field => field.property === "interestOfEntity");

        if (interestOfEntityField) {
            interestOfEntityField.value = interestOfEntity;
        }
    }

    public deleteLossPayee(id: Guid) {
        const index = this.lossPayeeDetails.findIndex(list => list.id === id);
        this.lossPayeeDetails.splice(index, 1);
        if (this.isLossPayeeListEmpty() || this.isLossPayeeOpenForEditing()) {
            this.isSaveDisabled = true;
        }
        else {
            this.isSaveDisabled = false;
        }
    }

    public addToList(formValues: any) {
        let mappedValues = { id: Guid.create(), lossPayee: formValues, isVisible: false } as ILossPayeeDetails;
        mappedValues.lossPayee.countryIsoCode = formValues.countryIsoCode != null ? formValues.countryIsoCode.hidden : null;

        this.lossPayeeDetails.push(mappedValues);
        this.formModalConfig = null;
        this.isSaveDisabled = false;
    }

    public updateListItem(formValues: any, formItem: any) {
        this.lossPayeeDetails.map(list => {
            if (list.id === formItem.id) {
                const mappedValues = list as ILossPayeeDetails;
                mappedValues.lossPayee = formValues;
                mappedValues.isVisible = false;
                mappedValues.lossPayee.countryIsoCode = formValues.countryIsoCode != null ? formValues.countryIsoCode.hidden : null;
                return mappedValues;
            }
            return list;
        });

        this.formModalConfig = null;
        this.isSaveDisabled = false;
    }

    public cancelEditing(form) {
        this.formModalConfig = null;
        if (form) {
            form.isVisible = false;
        }
        if (this.lossPayeeDetails.length > 0) {
            this.isSaveDisabled = false;
        }
    }

    private getLossPayeeForEditing(id: Guid) {
        return Object.assign({}, this.lossPayeeDetails.find(lossPayeeDetail => lossPayeeDetail.id === id).lossPayee);
    }

    private handleAddButtonsState() {
        this.addButton = this.lossPayeeForm.buttons[this.lossPayeeForm.buttons.findIndex(btn => btn.property === this.addButtonProperty)];
        if (this.isButtonsSet()) {
            if (this.lossPayeeForm.form.invalid) {
                this.disableAddButton();
            } else {
                this.enableAddButton();
            }
        }
    }

    private isButtonsSet(): boolean {
        return this.addButton ? true : false;
    }

    public disableAddButton() {
        if (!this.addButton.disable) {
            this.addButton.disable = true;
            this.formCreatorService.setForm(this.lossPayeeForm);
        }
    }

    private enableAddButton() {
        if (this.addButton.disable) {
            this.addButton.disable = false;
            this.formCreatorService.setForm(this.lossPayeeForm);
        }
    }

    private isLossPayeeListEmpty(): boolean {
        return this.lossPayeeDetails.length === 0;
    }

    private isLossPayeeOpenForEditing(): boolean {
        return this.lossPayeeDetails.some(list => list.isVisible);
    }

    protected abstract save(): void;
}
