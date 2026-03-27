import { DecimalPipe } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { LimitBasis } from '@app/enums/LimitBasis';
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import { CoverageLimit, Currency, UnderwriterRoleLimitValidationRule } from "@app/models";
import * as Models from "@app/models/auto-generated";
import { LeadLimitConfiguration } from "@app/models/extendedModels/LeadLimitConfiguration";
import { PropertyLimitConfig } from '@app/quote/models/PropertyLimitConfig';
import { LimitRuleFilter } from "@app/quote/view-models/LimitRuleFilter";
import { CoverageService } from '@app/services/coverage.service';
import { DictionaryHelperService } from "@app/services/dictionary-helper.service";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { CoverageCalculationService } from "@app/services/coverage-calculation.service";

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LimitComponent),
        },
    ],
    selector: "limit",
    styleUrls: ["./limit.component.scss"],
    templateUrl: "./limit.component.html",
})
export class LimitComponent implements ControlValueAccessor, OnInit, AfterViewInit, IsValid, MarkAsTouched {
    minValue: number | null = null;
    isTotalInsuredLimitTypeCode: boolean = false;
    public limitReadOnly: boolean = false;
    private _readonly: boolean = false;

    @Input() public currency: Currency = {
        id: 1,
        isoCode: "GBP",
        name: "pound",
        symbol: "£",
        rate: 1.0,
    };

    @Input()
    public coverageType: Models.CoverageType = null;

    @Input() public set readonly(value: boolean) {
        if (this.limitReadOnly === false) {
            this.limitReadOnly = value;
        }
        this._readonly = value;
    }
    get readonly(): boolean {
        return this._readonly;
    }

    @Input()
    set isSelected(value: boolean) {
        this.isLimitSelected = value;
        this.limitValueChanged();
        if (value === true) {
            this.minValue = 1;
        } else this.minValue = null;
        this.limitvalue?.setMinValueValidator(this.minValue);
    }

    @Input()
    set leadLimitConfiguration(config: LeadLimitConfiguration) {
        if (config) {
            this.leadConfiguration = config;
            this.previousLeaderValue = this.coverageCalculationService.calculateLeadLimitValue(config);
            this.previousLeaderLimitBasis = config.leaders[0]?.limitBasis;
            this.previousLeaderCostBasis = config.leaders[0]?.costBasis;
        }
    }

    @Input()
    set limit(val: CoverageLimit) {
        this.value = this.applyCap(val);

        if (this.value?.coverageLimitType?.limitTypeCode === PropertyLimitConfig.TotalInsuredLimitCode) {
            this.isTotalInsuredLimitTypeCode = true;
            this.limitReadOnly = true;
        }

        if (this.changeEvent) {
            this.changeEvent(this.value);
        }
    }

    get limit(): CoverageLimit {
        return this.value;
    }

    @Input()
    set leadLimitValue(newValue: number) {
        const isValidLimitValue = newValue !== null && !isNaN(newValue) && newValue > 0;
        if (!isValidLimitValue || !this.form || !this.leadConfiguration) {
            return;
        }

        const finalNewValue = Math.round(newValue * this.leadConfiguration.multiplicationFactor);
        const leadDefault = this.coverageCalculationService.calculateLeadDefaultLimitValue(this.leadConfiguration);
        const limitDefault = this.value.coverageLimitType.defaultLimit;

        const shouldFollow = (!isNaN(this.previousLeaderValue) && finalNewValue > 0 && leadDefault === limitDefault) &&
            (this.previousLeaderValue === this.value.limit || this.value.limit === this.value.coverageLimitType.cap)

        if (shouldFollow) {
            this.value.limit = finalNewValue;
            this.limitValueChanged();
        }

        if (finalNewValue > 0) {
            this.previousLeaderValue = finalNewValue;
        }
    }

    @Input()
    set leadLimitBasis(limitBasisId: number) {
        const isValidLimitBasis = limitBasisId !== null && !isNaN(limitBasisId);
        if (!isValidLimitBasis || !this.form || !this.leadConfiguration) {
            return;
        }
        const leadDefault = this.leadConfiguration.leaders[0].coverageLimitType.defaultLimitBasis;
        const limitDefault = this.value.coverageLimitType.defaultLimitBasis;

        const shouldFollow = this.previousLeaderLimitBasis && this.previousLeaderLimitBasis === this.value.limitBasis && leadDefault === limitDefault;

        if (shouldFollow) {
            this.value.limitBasis = limitBasisId;
        }
        this.previousLeaderLimitBasis = limitBasisId;
    }

    @Input()
    set leadLimitCostBasis(limitCostBasisId: number) {
        const isValidCostBasis = limitCostBasisId !== null && !isNaN(limitCostBasisId);
        if (!isValidCostBasis || !this.form || !this.leadConfiguration) {
            return;
        }

        const leadDefault = this.leadConfiguration.leaders[0].coverageLimitType.defaultCostBasis;
        const limitDefault = this.value.coverageLimitType.defaultCostBasis;

        const shouldFollow = this.previousLeaderCostBasis && this.previousLeaderCostBasis === this.value.costBasis && leadDefault === limitDefault;

        if (shouldFollow) {
            this.value.costBasis = limitCostBasisId;
        }
        this.previousLeaderCostBasis = limitCostBasisId;
    }

    @Output() public setForm = new EventEmitter<FormGroup>();

    @ViewChild("limitvalue") public limitvalue: CurrencyComponent;

    public form: FormGroup;
    public limitKeys: string[];
    public costKeys: string[];
    public hasWarning: boolean = false;
    public warningMessage: string;
    public isLimitSelected: boolean = false;

    private value: CoverageLimit;
    private changeEvent: any;
    private touchEvent: any;
    private leadConfiguration: LeadLimitConfiguration = null;
    private previousLeaderValue: number = null;
    private previousLeaderLimitBasis: number = null;
    private previousLeaderCostBasis: number = null;

    constructor(
        protected fb: FormBuilder,
        protected dictionaryHelper: DictionaryHelperService,
        protected readonly underwriterCoverageAuthorityService: UnderwriterCoverageAuthorityService,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly decimalPipe: DecimalPipe,
        private readonly coverageService: CoverageService,
        private coverageCalculationService: CoverageCalculationService
    ) { }

    public ngOnInit() {
        this.form = this.fb.group({
            costBasis: [""],
            limitBasis: [""],
            limitValue: [""],
        });

        this.limitKeys = this.dictionaryHelper.getDictionaryKeysByAlphabeticalOrder(this.limit.coverageLimitType.availableLimitBasis);

        this.costKeys = Object.keys(this.limit.coverageLimitType.availableCostBasis);

        if (this.readonly) {
            this.form.disable();
        }

        this.setForm.emit(this.form);

    }

    public ngAfterViewInit(): void {
        this.limitValueChanged();
    }

    public limitBasisError(): boolean {
        if (this.form) {
            const control = this.form.get("limitBasis");
            return this.isSelected && control.touched && this.limit.limitBasis === null;
        }
        return false;
    }

    public costBasisError(): boolean {
        if (this.form) {
            const control = this.form.get("costBasis");
            return this.isLimitSelected && control.touched && this.limit.costBasis === null;
        }
        return false;
    }

    public isValid(): boolean {
        if (this.readonly) {
            return true;
        }

        // total insured value
        if (this.limit?.coverageLimitType?.limitTypeCode === PropertyLimitConfig.TotalInsuredLimitCode) {
            return true;
        }

        return this.form.get("limitBasis").valid && this.form.get("costBasis").valid && this.limitvalue.isValid();
    }

    public markAsTouched(): void {
        Object.keys(this.form.controls)
            .map((key) => this.form.controls[key])
            .forEach((control) => {
                control.markAsTouched();
            });
        this.limitvalue.markAsTouched();
    }

    public writeValue(obj): void {
        this.limit = obj;
    }

    public registerOnChange(fn): void {
        this.changeEvent = fn;
    }

    public registerOnTouched(fn): void {
        this.touchEvent = fn;
    }

    public setDisabledState(isDisabled: boolean) {
        this.readonly = isDisabled;
    }

    public limitValueChanged() {
        this.hasWarning = false;
        this.applyCap(this.value);
        this.checkUnderwriterAuthority();
        if(this.isTotalInsuredLimitTypeCode && this.form) this.form.get("limitBasis").disable();
        setTimeout(() => { this.changeDetector.detectChanges(); }, 0);
    }

    public checkUnderwriterAuthority() {

        if (!this.shouldBeCheckedForAuthority()) {
            return;
        }

        const limitAuthorityRuleFilter: LimitRuleFilter = this.underwriterCoverageAuthorityService.getLimitAuthorityRuleFilter(
            this.coverageType.businessLine.name,
            this.coverageType.insuringClauseCode.name,
            this.coverageType.insuringClauseSectionCode.name,
            this.limit.coverageLimitType.limitTypeCode,
            this.currency
        );

        let limitToCheckForAuthority = Object.assign({}, this.limit);
        limitToCheckForAuthority.limit = this.limitvalue.value;

        const hasValidLimitAuthority = this.underwriterCoverageAuthorityService.hasValidLimitAuthority(limitToCheckForAuthority, limitAuthorityRuleFilter);

        if (!hasValidLimitAuthority) {
            const underwriterRoleLimitValidationRule: UnderwriterRoleLimitValidationRule =
                this.underwriterCoverageAuthorityService.getLimitAuthorityRuleByFilters(limitAuthorityRuleFilter);

            this.hasWarning = true;
            if (underwriterRoleLimitValidationRule) {
                this.warningMessage =
                    "Maximum limit allowed to quote is " + this.currency.symbol + this.decimalPipe.transform(underwriterRoleLimitValidationRule.maxLimit, "1.0-0");
            } else {
                this.warningMessage = "No underwriter authority";
            }
        }

        this.underwriterCoverageAuthorityService.setWarningStatus("LIMIT" + this.value.limitTypeId, this.hasWarning);
    }

    public onLimitBlur() {
        this.applyCap(this.value);
    }

    public updateTotalInsuredLimitValue() {
        if (this.isTotalInsuredLimitTypeCode) {
            this.limitReadOnly = true;
            if (this.coverageService.firstLossLimitValue && this.coverageService.firstLossLimitValue > 0 &&
                this.coverageService.totalInsuredLimitValue > this.coverageService.firstLossLimitValue) {
                this.limit.limit = this.coverageService.firstLossLimitValue;
                this.limit.limitBasis = LimitBasis.FirstLossLimit;
            } else {
                this.limit.limit = this.coverageService.totalInsuredLimitValue;
                this.limit.limitBasis = LimitBasis.TotalInsuredValue;
            }
        }
    }

    private applyCap(val: CoverageLimit): CoverageLimit {
        if (val.coverageLimitType.cap !== null && val.coverageLimitType.cap > 0) {
            if (val?.limit > val.coverageLimitType.cap) {
                val.limit = val.coverageLimitType.cap;
            }
        }
        return val;
    }

    private isValidLimitValue = () => this.limitvalue && this.limitvalue.value && this.value && (!this.limitvalue.form.dirty || this.limitvalue.isValid());

    private shouldBeCheckedForAuthority = () => this.isLimitSelected && this.isValidLimitValue() && !this.underwriterCoverageAuthorityService.isApprovedQuote();
}
