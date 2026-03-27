import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    QueryList,
    SimpleChanges,
    ViewChildren,
    forwardRef,
} from "@angular/core";
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import { Coverage, Currency, Product } from "@app/models";
import { QuoteService } from "@app/quote/services/quote.service";
import { CoverageItem } from "@app/quote/view-models/CoverageItem";
import { CoverageItemService } from "@app/services/coverage-item.service";
import { CoverageService } from "@app/services/coverage.service";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { UserService } from "@app/services/user.service";
import { Observable } from "rxjs";
import { CoverageOptionComponent } from '@app/quote/components/coverage/coverage-option/coverage-option.component';

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CoverageComponent),
        },
    ],
    selector: "coverage",
    styleUrls: ["./coverage.component.scss"],
    templateUrl: "./coverage.component.html",
})
export class CoverageComponent implements AfterViewInit, ControlValueAccessor, OnInit, OnChanges, IsValid, MarkAsTouched {
    @Input()
    set isSelected(val: boolean) {
        if (val === this.isCoverageSelected) return;
        this.isCoverageSelected = val;
        if (this.coverage) {
            this.setSelection(val);
        }
    }

    get isSelected(): boolean {
        return this.isCoverageSelected;
    }

    @Input() public isFirstLoad: boolean = false;
    @Input() public currency: Currency = {
        id: 1,
        isoCode: "GBP",
        name: "pound",
        symbol: "£",
        rate: 1.0,
    };

    @Input() public readonly: boolean = false;

    @Input()
    set coverageItem(coverageItem: CoverageItem) {
        this.value = coverageItem;
        this.coverage = coverageItem.coverage;
        this.coverageOptionItems = coverageItem.childCoverageItems;
        this.hasSingleChildVisible = this.hasOnlyOneChildVisible();
        if (this.changeEvent) {
            this.changeEvent(this.coverage);
        }
    }

    get coverageItem(): CoverageItem {
        return this.value;
    }

    @Output() public isSelectedChange = new EventEmitter<boolean>();
    @Output() public onSelection = new EventEmitter<Coverage>();
    @Output() public onDeselection = new EventEmitter<Coverage>();
    @Output() public onChildOptionSelection = new EventEmitter<Coverage>();
    @Output() public onChildOptionDeselection = new EventEmitter<Coverage>();
    @Output() public onChange = new EventEmitter();
    @Output() public setForm = new EventEmitter<FormGroup>();

    @ViewChildren("coverageLimit") public coverageLimits: QueryList<IsValid & MarkAsTouched>;
    @ViewChildren("coverageOption") public coverageOptions: QueryList<IsValid & MarkAsTouched>;
    @ViewChildren("excess") public excessOptions: QueryList<IsValid & MarkAsTouched>;
    @ViewChildren(CoverageOptionComponent) public coverageOptionComponents!: QueryList<CoverageOptionComponent>;

    public coverageForm: FormGroup;
    public hasSingleChildVisible: boolean = false;
    public coverageOptionItems: CoverageItem[] = [];
    public coverage: Coverage;
    public readonly isMultiplePropertyFeatureToggleOn: boolean = this._userService.isFeatureAccessible("multipleProperties");

    private isCoverageSelected: boolean = false;
    private value: CoverageItem;
    private changeEvent: any;
    private touchEvent: any;
    private quoteReference = this.quoteService.getQuote()?.quoteReference;
    private selectedProduct: Product = this.quoteService.getQuote()?.product;
    public isMultiplePropertyBusinessLineProduct$: Observable<boolean>;

    constructor(
        protected coverageService: CoverageService,
        protected coverageItemService: CoverageItemService,
        private changeDetector: ChangeDetectorRef,
        protected fb: FormBuilder,
        public modalDialogService: ModalDialogService,
        private _userService: UserService,
        private navigationOverrideService: NavigationOverrideService,
        private quoteService: QuoteService
    ) { }

    public ngOnInit() {
        if (
            this.isFirstLoad &&
            this.coverage.childCoverages &&
            this.coverage.coverageType.childCoverageTypes &&
            this.coverage.coverageType.childCoverageTypes.length > 0
        ) {
            this.expandAndSelectAll();
            this.isFirstLoad = false;
        }

        if (this.isMultiplePropertyFeatureToggleOn === true)
            this.isMultiplePropertyBusinessLineProduct$ = this.coverageService.isMultiplePropertyBusinessLineProduct(this.coverage.coverageType.businessLine?.name, this.selectedProduct.productName);

        this.coverageForm = this.fb.group({});
        this.setForm.emit(this.coverageForm);
    }

    public ngOnChanges(changes: SimpleChanges) {
        const isSelectedChange = changes.isSelected;
        if (isSelectedChange && !isSelectedChange.isFirstChange()) {
            if (!this.isCoverageSelected) {
                this.coverageOptionItems.forEach((coverageOptionItem) => {
                    coverageOptionItem.isSelected = false;
                });
            } else {
                this.expandAndSelectAll();
            }
        }
    }

    public ngAfterViewInit() {
        this.coverageForm.valueChanges.subscribe(() => {
            this.onChange.emit();
        });
    }

    public expandAndSelectAll() {
        for (const coverageItem of this.coverageOptionItems) {
            if (!coverageItem.coverage.coverageType.isAdditionalCoverage) {
                if (this.isFirstLoad) {
                    coverageItem.isSelected = coverageItem.coverage.coverageType.isSelectedByDefault;
                } else {
                    coverageItem.isSelected = true;
                }
                if (coverageItem.isSelected) {
                    this.onOptionSelection(coverageItem.coverage);
                    this.isExpanded = true;
                }
                else {
                    this.onOptionDeselection(coverageItem.coverage);
                }
            }
        }
    }

    public writeValue(obj): void {
        this.coverage = obj;
    }

    public registerOnChange(fn): void {
        this.changeEvent = fn;
    }

    public registerOnTouched(fn): void {
        this.touchEvent = fn;
    }

    public onOptionSelection(coverage: Coverage) {
        if (!this.isCoverageSelected) {
            this.isCoverageSelected = true;
            this.onSelection.emit(this.coverage);
        }

        this.onChildOptionSelection.emit(coverage);
        const index = this.coverageService.getSelectedCoverageIndex(this.coverage.childCoverages, coverage.coverageType.insuringClauseSectionCode.name, true);

        if (index === -1) {
            this.coverage.childCoverages.push(coverage);
            this.onChange.emit();
        }

        if (this.coverageOptionComponents && this.coverageOptionComponents.length > 0) {
            for (const component of this.coverageOptionComponents) {
                component.reCalculateLeadValues();
            }
        }
    }

    public onOptionDeselection(coverage: Coverage) {
        const index = this.coverageService.getSelectedCoverageIndex(this.coverage.childCoverages, coverage.coverageType.insuringClauseSectionCode.name, true);

        if (index !== -1) {
            this.coverage.childCoverages.splice(index, 1);
        }

        if (this.isCoverageSelected && this.coverage.childCoverages.length === 0 && !this.hasSingleChildVisible) {
            this.toggleSelection();
        }

        this.onChange.emit();
        this.onChildOptionDeselection.emit(coverage);
    }

    get controlSymbol(): string {
        return this.coverage.coverageType.isAdditionalCoverage ? "" : this.isExpanded ? "-" : "+";
    }

    public get isExpanded(): boolean {
        return this.coverageItemService.getCoverageExpandedState(this.coverage.coverageType);
    }

    public set isExpanded(val: boolean) {
        this.coverage.isExpanded = val;
        this.coverageItemService.saveCoverageExpandedState(this.coverage.coverageType, val);
    }

    public toggleExpansion() {
        if (this.coverage.coverageType.isAdditionalCoverage) return;
        this.isExpanded = !this.isExpanded;
    }

    public toggleSelection() {
        this.isCoverageSelected = !this.isCoverageSelected;
        this.setSelection(this.isCoverageSelected);
    }

    private setSelection(value: boolean) {
        this.isExpanded = value;
        if (this.hasSingleChildVisible) {
            this.coverageOptionItems[0].isSelected = this.isCoverageSelected;
            if (this.isCoverageSelected) {
                this.onOptionSelection(this.coverageOptionItems[0].coverage);
            } else {
                this.onOptionDeselection(this.coverageOptionItems[0].coverage);
            }
        }
        this.isSelectedChange.emit(this.isCoverageSelected);
        this.triggerSelectionEvents();
    }

    public markAsTouched(): void {
        if (this.touchEvent) {
            this.touchEvent();
        }

        if (!this.isValid()) {
            this.isExpanded = true;
            this.changeDetector.detectChanges();
        }
        if (this.coverageLimits) {
            this.coverageLimits.forEach((x) => x.markAsTouched());
        }
        if (this.excessOptions) {
            this.excessOptions.forEach((x) => x.markAsTouched());
        }
        if (this.coverageOptions) {
            this.coverageOptions.forEach((x) => x.markAsTouched());
        }
    }

    public isValid(): boolean {
        if (this.coverageLimits && this.coverageLimits.filter((x) => !x.isValid()).length !== 0) {
            return false;
        }
        if (this.excessOptions && this.excessOptions.filter((x) => !x.isValid()).length !== 0) {
            return false;
        }
        if (this.coverageOptions && this.coverageOptions.filter((x) => !x.isValid()).length !== 0) {
            return false;
        }

        // Need to check the viewmodel as well as components in case the component is not displayed
        if (this.isCoverageSelected && !this.checkCoverageModel(this.coverage)) {
            return false;
        }
        if (this.coverage.childCoverages) {
            for (const child of this.coverage.childCoverages) {
                if (!this.checkCoverageModel(child)) {
                    return false;
                }
            }
        }

        return true;
    }

    public addSubFormGroup(name: string, formGroup: FormGroup) {
        this.coverageForm.addControl(name, formGroup);
    }

    public hasOnlyOneChildVisible(): boolean {
        if (!this.coverageOptionItems) return false;
        if (this.coverageOptionItems.length === 1) return true;
        let i = 0;
        let count = 0;
        while (i <= this.coverageOptionItems.length - 1 && count < 2) {
            if (this.isCoverageOptionVisible(this.coverageOptionItems[i].coverage)) {
                count++;
            }
            i++;
        }
        return count === 1;
    }

    public allowNavigation(): void {
        this.navigationOverrideService.allowNavigation = true;
    }

    private isCoverageOptionVisible(coverage: Coverage): boolean {
        if (coverage.limits && coverage.limits.filter((l) => !l.coverageLimitType.isHidden).length > 0) {
            return true;
        }

        if (coverage.excesses && coverage.excesses.filter((l) => !l.excessType.isHidden).length > 0) {
            return true;
        }
        return false;
    }

    private checkCoverageModel(coverage: Coverage): boolean {
        if (coverage.limits) {
            for (const limit of coverage.limits) {
                if (limit.limit === null || limit.costBasis === null || limit.limitBasis === null) {
                    return false;
                }
            }
        }
        if (coverage.excesses) {
            for (const xs of coverage.excesses) {
                if (xs.excess === null || xs.excessBasisId === null) {
                    return false;
                }
            }
        }

        return true;
    }

    private triggerSelectionEvents() {
        if (this.isSelected) {
            this.onSelection.emit(this.coverage);
        } else {
            this.onDeselection.emit(this.coverage);
        }
    }
}
