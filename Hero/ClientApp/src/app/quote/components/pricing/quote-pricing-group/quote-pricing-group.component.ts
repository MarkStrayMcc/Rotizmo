import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Currency, PricingGroup, PublishQuotePricingGroup } from "@app/models";
import { Subscription } from "rxjs";

@Component({
    selector: "quote-pricing-group",
    templateUrl: "./quote-pricing-group.component.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: QuotePricingGroupComponent,
            multi: true
        }
    ],
    styleUrls: ["./quote-pricing-group.component.scss"]
})

export class QuotePricingGroupComponent implements OnInit, ControlValueAccessor, OnDestroy {
    @Input() public index: number;
    @Input() public readonly: boolean;
    @Input() public currency: Currency = {
        id: 1,
        isoCode: "GBP",
        name: "Pound",
        symbol: "£",
        rate: 1.0
    };

    @Input() public pricingGroupInfo: PricingGroup = {
        isEditable: true,
        title: "",
        increasedLimitFactors: []
    } as PricingGroup;

    @Input() public leadLimitValue: number;
    @Input() public leadExcessValue: number;

    public form: FormGroup;
    public editableSubscription: Subscription;
    public formChangesSubscription: Subscription;

    private onChangeEvent: any;
    private onTouchEvent: () => void;
    /**
     * Constructor
     */
    constructor(
        private readonly formBuilder: FormBuilder
    ) { }

    /**
     * Control Value Accessor implementation
     */
    public writeValue(publishQuotePricingGroup: PublishQuotePricingGroup): void {
        this.form.controls.pricingGroupId.setValue(publishQuotePricingGroup.pricingGroupId);
        this.form.controls.title.setValue(publishQuotePricingGroup.title);
        this.form.controls.productId.setValue(publishQuotePricingGroup.productId);
        this.form.controls.minMaxLimit.setValue([publishQuotePricingGroup.minLimit, publishQuotePricingGroup.maxLimit]);
        this.form.controls.minMaxExcess.setValue([publishQuotePricingGroup.minExcess, publishQuotePricingGroup.maxExcess]);
    }
    public registerOnChange(changeEvent: any): void {
        this.onChangeEvent = changeEvent;
    }
    public registerOnTouched(touchEvent: any): void {
        this.onTouchEvent = touchEvent;
    }
    public setDisabledState?(isDisabled: boolean): void {
        this.form.controls.isEditable.setValue(!isDisabled);
    }

    public get showLimitSlider() {
        return this.pricingGroupInfo.minLimit !== this.pricingGroupInfo.maxLimit &&
            this.pricingGroupInfo.minLimit !== null &&
            this.pricingGroupInfo.maxLimit !== null &&
            this.pricingGroupInfo.minLimit !== undefined &&
            this.pricingGroupInfo.maxLimit !== undefined;
    }

    public get showExcessSlider() {
        return this.pricingGroupInfo.minExcess !== this.pricingGroupInfo.maxExcess &&
            this.pricingGroupInfo.minExcess !== null &&
            this.pricingGroupInfo.maxExcess !== null &&
            this.pricingGroupInfo.minExcess !== undefined && this.pricingGroupInfo.maxExcess !== undefined;
    }

    public ngOnInit(): void {
        if (this.pricingGroupInfo) {
            this.setupFormGroup();

            if (this.form) {
                if (this.form.controls.isEditable) {
                    this.form.controls.isEditable.setValue(this.pricingGroupInfo.isEditable);
                }
                this.editableSubscription = this.form.controls.isEditable.valueChanges.subscribe(x => {
                    this.readonly = !(x as boolean);
                    if (this.readonly) {
                        this.form.controls.minMaxLimit.disable();
                        this.form.controls.minMaxExcess.disable();
                        this.form.controls.increasedLimitFactor.disable();
                    } else {
                        this.form.controls.minMaxLimit.enable();
                        this.form.controls.minMaxExcess.enable();
                        this.form.controls.increasedLimitFactor.enable();
                    }
                });
                this.formChangesSubscription = this.form.valueChanges.subscribe(data => {
                    this.onFormChanges(data);
                });
            }
        }
    }

    private setupFormGroup() {
        this.form = this.formBuilder.group({
            isEditable: [this.pricingGroupInfo.isEditable],
            pricingGroupId: [this.pricingGroupInfo.pricingGroupId],
            title: [this.pricingGroupInfo.title],
            minMaxLimit: [{ value: [this.pricingGroupInfo.defaultMinLimit, this.pricingGroupInfo.defaultMaxLimit], disabled: this.readonly }],
            minMaxExcess: [{ value: [this.pricingGroupInfo.defaultMinExcess, this.pricingGroupInfo.defaultMaxExcess], disabled: this.readonly }],
            productId: [this.pricingGroupInfo.productId],
            increasedLimitFactor: [{ value: this.pricingGroupInfo.increasedLimitFactor, disabled: this.readonly }]
        });
    }
    private onFormChanges(data) {
        if (this.onChangeEvent) {
            const publishedData = {} as any; // so that parent can respond to the editable flag
            publishedData.increasedLimitFactor = data.increasedLimitFactor;
            if (data.minMaxExcess) {
                publishedData.minExcess = data.minMaxExcess[0];
                publishedData.maxExcess = data.minMaxExcess[1];
            }
            if (data.minMaxLimit) {
                publishedData.minLimit = data.minMaxLimit[0];
                publishedData.maxLimit = data.minMaxLimit[1];
            }

            publishedData.pricingGroupId = data.pricingGroupId;
            publishedData.productId = data.productId;
            publishedData.title = data.title;
            publishedData.isEditable = data.isEditable;

            this.onChangeEvent(publishedData);
        }
    }

    public ngOnDestroy(): void {
        if (this.editableSubscription) {
            this.editableSubscription.unsubscribe();
        }
        if (this.formChangesSubscription) {
            this.formChangesSubscription.unsubscribe();
        }
    }

}
