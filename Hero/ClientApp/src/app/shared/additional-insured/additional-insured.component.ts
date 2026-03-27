import { ElementRef, OnDestroy, OnInit, ViewChild, Directive } from "@angular/core";
import { CfcContact } from "@app/models";
import { DropdownService } from "@app/services/dropdown.service";
import { UserService } from "@app/services/user.service";
import { FormButton, FormConfig, FormItem } from "@app/shared/form-creator/form-creator.config";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { Guid } from "guid-typescript";
import { Country } from "@app/models/auto-generated/Country";
import { ListActionType } from "@app/shared/ListActionType";
import { IAdditionalInsuredDetailsList } from "@app/shared/additional-insured/IAdditionalInsuredDetailsList";
import { IAdditionalInsuredList } from "@app/shared/additional-insured/IAdditionalInsuredList";
import { AdditionalInsuredConfigBuilder } from "@app/shared/additional-insured/additional-insured.config-builder";
import { AdditionalInsured } from "@app/models/auto-generated/AdditionalInsured";

@Directive()
export abstract class AdditionalInsuredComponent implements OnInit, OnDestroy {
    public isSaveDisabled = true;
    public isSaved = false;
    public userProfile: CfcContact;
    public formModalConfig: FormConfig;
    public additionalInsuredForm: FormItem;
    public formList: IAdditionalInsuredDetailsList[] = [];
    public additionalInsuredList = {} as IAdditionalInsuredList;
    public addButton: FormButton;
    public countries: any[];
    public actionType: ListActionType;
    public additionalInsuredForEditing: AdditionalInsured;

    public addButtonProperty: string = "additional-insured-add";

    @ViewChild("formComponent") formComponent: ElementRef;

    constructor(
        public userService: UserService,
        public formCreatorService: FormCreatorService,
        public dropdownService: DropdownService,
        public additionalInsuredConfigBuilder: AdditionalInsuredConfigBuilder
    ) { }

    public ngOnInit() {
        this.userProfile = this.userService.getUser();
        this.formHandler();
        this.dropdownService.getCountries().subscribe((countries) => this.countries = countries);
    }

    public ngOnDestroy() { }

    public formHandler() {
        this.formCreatorService.formInstance.subscribe((form) => {
            if (form && this.additionalInsuredForm !== form) {
                this.additionalInsuredForm = form;
                this.handleAddButtonsState();
            }
        });
    }

    public addAdditionalInsured() {
        this.actionType = ListActionType.Add;
        this.formList.map((list) => {
            list.isVisible = false;
        });
        this.formModalConfig = this.additionalInsuredConfigBuilder.setConfig(this.countries);
        this.isSaveDisabled = true;
    }

    public editAdditionalInsured(id: Guid) {
        let selectedCountry: Country;
        this.formList.map((list) => {
            if (list.id === id) {
                selectedCountry = this.countries.find(country => country.hidden === list.additionalInsured.countryIsoCode) as Country;
                list.isVisible = true;
            } else {
                list.isVisible = false;
            }
        });
        this.actionType = ListActionType.Edit;
        this.formModalConfig = this.additionalInsuredConfigBuilder.setConfig(this.countries, selectedCountry);
        this.additionalInsuredForEditing = this.getAdditionalInsuredForEditing(id);
        this.isSaveDisabled = true;
    }

    public deleteAdditionalInsured(id: Guid) {
        const index = this.formList.findIndex(list => list.id === id);
        this.formList.splice(index, 1);
        if (this.isAdditionalInsuredListEmpty() || this.isAdditionalInsuredOpenForEditing()) {
            this.isSaveDisabled = true;
        }
        else {
            this.isSaveDisabled = false;
        }
    }

    public addToList(formValues: any) {
        let mappedValues = { id: Guid.create(), additionalInsured: formValues, isVisible: false } as IAdditionalInsuredDetailsList;
        mappedValues.additionalInsured.countryIsoCode = formValues.countryIsoCode != null ? formValues.countryIsoCode.hidden : null;

        this.formList.push(mappedValues);
        this.formModalConfig = null;

        this.additionalInsuredList.additionalInsureds = this.formList;
        this.isSaveDisabled = false;
    }

    public updateListItem(formValues: any, formItem: any) {
        this.formList.map(list => {
            if (list.id === formItem.id) {
                const mappedValues = list as IAdditionalInsuredDetailsList;
                mappedValues.additionalInsured = formValues;
                mappedValues.isVisible = false;
                mappedValues.additionalInsured.countryIsoCode = formValues.countryIsoCode != null ? formValues.countryIsoCode.hidden : null;
                return mappedValues;
            }
            return list;
        });

        this.formModalConfig = null;

        this.additionalInsuredList.additionalInsureds = this.formList;
        this.isSaveDisabled = false;
    }

    public cancelEditing(form) {
        this.formModalConfig = null;
        if (form) {
            form.isVisible = false;
        }
        if (this.formList.length > 0) {
            this.isSaveDisabled = false;
        }
    }

    private getAdditionalInsuredForEditing(id: Guid) {
        return Object.assign({}, this.formList.find(additionalInsuredDetail => additionalInsuredDetail.id === id).additionalInsured);
    }

    private handleAddButtonsState() {
        this.addButton = this.additionalInsuredForm.buttons[this.additionalInsuredForm.buttons.findIndex(btn => btn.property === this.addButtonProperty)];
        if (this.isButtonsSet()) {
            if (this.additionalInsuredForm.form.invalid) {
                this.disableAddButton();
                return false;
            }
            this.enableAddButton();
        }
    }

    public isButtonsSet(): boolean {
        return this.addButton ? true : false;
    }

    public disableAddButton() {
        if (!this.addButton.disable) {
            this.addButton.disable = true;
            this.formCreatorService.setForm(this.additionalInsuredForm);
        }
    }

    private enableAddButton() {
        if (this.addButton.disable) {
            this.addButton.disable = false;
            this.formCreatorService.setForm(this.additionalInsuredForm);
        }
    }

    private isAdditionalInsuredListEmpty(): boolean {
        return this.formList.length === 0;
    }

    private isAdditionalInsuredOpenForEditing(): boolean {
        return this.formList.some(list => list.isVisible);
    }

    protected abstract save(): void;
}
