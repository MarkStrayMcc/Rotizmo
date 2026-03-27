import {
    Component, EventEmitter, forwardRef, Input, OnInit, Output,
    QueryList, ViewChild, ViewChildren
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormBuilder } from "@angular/forms";
import {
    Coverage,
    CoverageExcess,
    CoverageLimit,
    Currency
} from "@app/models";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import { UnderwriterCoverageAuthorityService } from "@app/services/UnderwriterValidation/underwriter-coverage-authority.service";
import { CoverageCalculationService } from "@app/services/coverage-calculation.service";
import { CoverageItem } from "@app/quote/view-models/CoverageItem";
import { LeadLimitConfiguration } from "@app/models/extendedModels/LeadLimitConfiguration";
import { LeadExcessConfiguration } from "@app/models/extendedModels/LeadExcessConfiguration";
import { orderBy } from "lodash";
import { LimitComponent } from "@app/quote/components/coverage/limit/limit.component";

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CoverageOptionComponent)
        }],
    selector: "coverage-option",
    styleUrls: ["./coverage-option.component.scss"],
    templateUrl: "./coverage-option.component.html"
})
export class CoverageOptionComponent implements ControlValueAccessor, OnInit, IsValid, MarkAsTouched {

    @Input() public readonly: boolean = false;
    @Input() public currency: Currency = {
        id: 1,
        isoCode: "GBP",
        name: "pound",
        symbol: "£",
        rate: 1.0
    };
    // Note, header is hidden rather than not displayed to make sure the logic stays the same for
    // single section and multiple section clauses
    @Input() public showHeader: boolean = true;
    @Input() public isSelected: boolean = false;

    @Input()
    set option(coverageItem: CoverageItem) {
        this.coverageItem = coverageItem;
        this.coverage = coverageItem.coverage;
        if (this.changeEvent) {
            this.changeEvent(this.coverage);
        }
    }

    get option(): CoverageItem {
        return this.coverageItem;
    }

    @ViewChildren("coverageLimit") public coverageLimits: QueryList<IsValid & MarkAsTouched>;
    @ViewChildren("excess") public excessOptions: QueryList<IsValid & MarkAsTouched>;
    @ViewChild(LimitComponent) public limitComponent!: LimitComponent;

    @Output() public onSelection = new EventEmitter<Coverage>();
    @Output() public onDeselection = new EventEmitter<Coverage>();
    @Output() public setForm = new EventEmitter<FormGroup>();

    public coverageOptionForm: FormGroup;
    public hasLimits: boolean = false;
    public hasExcesses: boolean = false;
    public coverage: Coverage;

    private coverageItem: CoverageItem;
    private changeEvent: any;
    private touchEvent: any;
    private leadLimitConfigurations: { [code: string]: LeadLimitConfiguration } = {};
    private leadExcessConfigurations: { [code: string]: LeadExcessConfiguration } = {};

    constructor(
        protected fb: FormBuilder,
        private readonly underwriterCoverageAuthorityService: UnderwriterCoverageAuthorityService,
        private readonly coverageCalculationService: CoverageCalculationService) {
    }

    public ngOnInit() {
        if (this.option && this.coverage && this.coverage.limits && this.coverage.limits.length > 0) {
            this.hasLimits = true;
        }
        if (this.option && this.coverage && this.coverage.excesses && this.coverage.excesses.length > 0) {
            this.hasExcesses = true;
        }
        this.coverageOptionForm = this.fb.group({});
        this.setForm.emit(this.coverageOptionForm);
    }

    public writeValue(obj): void {
        this.option = obj;
    }

    public registerOnChange(fn): void {
        this.changeEvent = fn;
    }

    public registerOnTouched(fn): void {
        this.touchEvent = fn;
    }

    public toggleSelection(): void {
        if (this.readonly || this.isMandatory()) {
            return;
        }
        this.isSelected = !this.isSelected;

        this.triggerSelectionEvents();
    }

    public markAsTouched(): void {
        if (this.touchEvent) {
            this.touchEvent();
        }

        if (this.coverageLimits) {
            this.coverageLimits.forEach((x) => x.markAsTouched());
        }
        if (this.excessOptions) {
            this.excessOptions.forEach((x) => x.markAsTouched());
        }
    }

    public isValid(): boolean {
        if (this.coverageLimits && this.coverageLimits.filter((x) => !x.isValid()).length !== 0) {
            return false;
        }
        if (this.excessOptions && this.excessOptions.filter((x) => !x.isValid()).length !== 0) {
            return false;
        }
        return true;
    }

    public addSubFormGroup(name: string, formGroup: FormGroup) {
        this.coverageOptionForm.addControl(name, formGroup);
    }

    private triggerSelectionEvents() {
        if (this.isSelected) {
            this.onSelection.emit(this.coverage);
        } else {
            this.onDeselection.emit(this.coverage);
        }
    }

    public setDisabledState(isDisabled: boolean) {
        this.readonly = isDisabled;
    }

    public getLeadLimitConfiguration(limit: CoverageLimit): LeadLimitConfiguration {
        const leaders = this.getLeadLimits(limit);
        if (leaders) {
            return this.getOrCreateLeadLimitConfiguration(limit, leaders);
        }
        return null;
    }

    public getLeadExcessConfiguration(excess: CoverageExcess): LeadExcessConfiguration {
        const leaders = this.getLeadExcesses(excess);
        if (leaders) {
            return this.getOrCreateLeadExcessConfiguration(excess, leaders);
        }
        return null;
    }

    public getLeadLimitValue(limit: CoverageLimit): number {
        return this.coverageCalculationService.getLeadLimitValue(limit, this.coverageItem);
    }

    public getLeadLimitBasis(limit: CoverageLimit): number {
        return this.coverageCalculationService.getLeadLimitBasis(limit, this.coverageItem);
    }

    public getLeadCostBasis(limit: CoverageLimit): number {
        return this.coverageCalculationService.getLeadCostBasis(limit, this.coverageItem);
    }

    public getLeadLimits(limit: CoverageLimit): CoverageLimit[] {
        return this.coverageCalculationService.getLeadLimits(limit, this.coverageItem);
    }

    public getLeadExcessValue(excess: CoverageExcess): number {
        return this.coverageCalculationService.getLeadExcessValue(excess, this.coverageItem);
    }

    public getLeadExcessBasis(excess: CoverageExcess): number {
        return this.coverageCalculationService.getLeadExcessBasis(excess, this.coverageItem);

    }

    public getLeadExcesses(excess: CoverageExcess): CoverageExcess[] {
        return this.coverageCalculationService.getLeadExcesses(excess, this.coverageItem);
    }

    public isMandatory(): boolean {

        if (this.coverage && this.coverage.limits && this.coverage.limits.filter((x) => x.coverageLimitType.isMandatory).length > 0 ||
            this.coverage && this.coverage.excesses && this.coverage.excesses.filter((x) => x.excessType.isMandatory).length > 0) {

            return true;
        }

        return false;
    }

    public isHidden(): boolean {

        if (this.coverage && this.coverage.limits && this.coverage.limits.filter((x) => x.coverageLimitType.isHidden).length === this.coverage.limits.length &&
            this.coverage && this.coverage.excesses && this.coverage.excesses.filter((x) => x.excessType.isHidden).length === this.coverage.excesses.length) {

            return true;
        }

        return false;
    }

    public getLimits(): CoverageLimit[] {
        if (this.hasLimits && this.coverage.limits.length > 1) {
            return orderBy(this.coverage.limits, ["limitType.order"], ["asc"]);
        }
        return this.coverage.limits;
    }

    public getExcesses(): CoverageExcess[] {
        if (this.hasExcesses && this.coverage.excesses.length > 1) {
            return orderBy(this.coverage.excesses, ["excessType.order"], ["asc"]);
        }
        return this.coverage.excesses;
    }

    private getOrCreateLeadLimitConfiguration(limit: CoverageLimit, leaders: CoverageLimit[]): LeadLimitConfiguration {

        let config = this.leadLimitConfigurations[limit.coverageLimitType.limitTypeCode];

        if (!config) {
            const multiplicationFactor = limit.coverageLimitType.limitFollowMultiplicationFactor ? limit.coverageLimitType.limitFollowMultiplicationFactor : 1;

            config = new LeadLimitConfiguration(leaders, multiplicationFactor);

            this.leadLimitConfigurations[limit.coverageLimitType.limitTypeCode] = config;
        }
        return config;
    }

    private getOrCreateLeadExcessConfiguration(excess: CoverageExcess, leaders: CoverageExcess[]): LeadExcessConfiguration {
        let config = this.leadExcessConfigurations[excess.excessType.excessTypeCode];

        if (!config) {
            const multiplicationFactor = excess.excessType.excessFollowMultiplicationFactor ? excess.excessType.excessFollowMultiplicationFactor : 1;

            config = new LeadExcessConfiguration(leaders, multiplicationFactor);

            this.leadExcessConfigurations[excess.excessType.excessTypeCode] = config;
        }
        return config;
    }

    public reCalculateLeadValues() {
        var leadLimit = this.getLeadLimitValue(this.limitComponent.limit);
        if (leadLimit && leadLimit > 0 && this.limitComponent.limit.coverageLimitType.defaultLimit == this.limitComponent.limit.limit) {
            this.limitComponent.limit.limit = leadLimit;
            this.limitComponent.leadLimitValue = leadLimit;
        }
    }

}
