import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from "@angular/core";
import { AsyncValidatorFn, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { FormCreatorService } from '../services/form-creator.service';
import { FormConfig, FormField, FormItem } from "./form-creator.config";

@Component({
    selector: "shared-form-creator",
    templateUrl: "./form-creator.component.html",
    styleUrls: ["./form-creator.component.scss"],
})
export class SharedFormCreatorComponent implements OnChanges, OnDestroy {

    form: FormGroup;

    @Input()
    item: any = {};

    @Input()
    isSaving: boolean;

    @Input()
    config: FormConfig;

    @Output()
    validForm: EventEmitter<any> = new EventEmitter();

    private formSubscription: Subscription;

    constructor(
        private fb: FormBuilder,
        private formCreatorService: FormCreatorService
    ) { }

    private buildForm() {
        const allFields = FormConfig.getAllFields(this.config);
        const group = this.fb.group({});

        allFields.forEach(field => {
            const value = field.value;
            const validators = this.buildValidators(field);
            const asyncValidators = this.buildAsyncValidators(field);
            const formControl = new FormControl(value, Validators.compose(validators), Validators.composeAsync(asyncValidators));
            field.isDisabled ? formControl.disable() : formControl.enable();
            group.addControl(field.property, formControl);
        });
        this.form = group;
        const newFormValues: FormItem = {
            selector: this.config.selector,
            form: this.form,
            buttons: this.config.buttons
        };
        this.formCreatorService.setForm(newFormValues);
    }

    private buildValidators(field: FormField): ValidatorFn[] {
        return field.validators && field.validators.map(validation => validation.validator).filter(validator => validator);
    }

    private buildAsyncValidators(field: FormField): AsyncValidatorFn[] {
        return field.validators && field.validators.map(validation => validation.asyncValidator).filter(asyncValidator => asyncValidator);
    }

    ngOnDestroy() {
        this.formCreatorService.setEmailTemplate(null);

        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.config) {
            return;
        }
        if (!this.item) {
            this.item = {};
        }
        if (changes.config || changes.item) {
            const currentConfig = changes.config ? changes.config.currentValue : this.config;
            const allFields = FormConfig.getAllFields(currentConfig);
            allFields.forEach(field => {
                if (field.property &&
                    !this.item.hasOwnProperty(field.property)) {
                    this.item[field.property] = "";
                }
            });

            this.buildForm();

            this.subscribeActions();
        }
    }

    public buttonClicked(button) {
        this.formCreatorService.setButtonClicked(button.property);
    }

    private subscribeActions() {
        this.formSubscription = this.form.valueChanges.subscribe((data) => {
            const newFormValues: FormItem = {
                selector: this.config.selector,
                form: this.form,
                buttons: this.config.buttons
            };
            this.formCreatorService.setForm(newFormValues);
        });
    }


    public saveHandler() {
        if (this.form.valid) {
            this.setFieldsValue();
            this.validForm.emit(this.item);
        }
    }

    private setFieldsValue() {
        FormConfig.getAllFields(this.config)
            .filter(field => field.isAttachment())
            .forEach(field => {
                const val = field.getFinalValue(this.form.controls[field.property].value);
                this.item[field.property] = val;
            });

        FormConfig.getAllFields(this.config)
            .filter(field => field.isTextBox())
            .forEach(field => {
                const val = field.getFinalValue(this.form.controls[field.property].value);
                this.item[field.property] = val;
            });

        FormConfig.getAllFields(this.config)
            .filter(field => field.isSubject())
            .forEach(field => {
                const val = field.getFinalValue(this.form.controls[field.property].value);
                this.item[field.property] = val;
            });

        FormConfig.getAllFields(this.config)
            .filter(field => field.isContact())
            .forEach(field => {
                const val = field.getFinalValue(this.form.controls[field.property].value);
                this.item[field.property] = val;
            });

        FormConfig.getAllFields(this.config)
            .filter(field => field.isDropDown())
            .forEach(field => {
                this.item[field.property] = this.form.controls[field.property].value;
            });

        FormConfig.getAllFields(this.config)
            .filter(field => field.isCheckBox())
            .forEach(field => {
                this.item[field.property] = this.form.controls[field.property].value;
            });

        FormConfig.getAllFields(this.config)
            .filter(field => field.isDate())
            .forEach(field => {
                const val = field.getFinalValue(this.form.controls[field.property].value);
                this.item[field.property] = val;
            });

        FormConfig.getAllFields(this.config)
            .filter(field => field.isReadOnly())
            .forEach(field => {
                const val = this.form.controls[field.property].value;
                this.item[field.property] = val;
            });

        FormConfig.getAllFields(this.config)
            .filter(field => field.isTextArea())
            .forEach(field => {
                const val = this.form.controls[field.property].value;
                this.item[field.property] = val;
            });
    }
}
