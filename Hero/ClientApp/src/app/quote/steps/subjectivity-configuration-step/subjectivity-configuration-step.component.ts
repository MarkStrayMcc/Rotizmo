import {
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import {FormBuilder} from "@angular/forms";
import {AutocompleteDropdown} from "@app/components/autocomplete-dropdown";
import {IsDirty} from "@app/interfaces/IsDirty";
import {IsLoaded} from "@app/interfaces/IsLoaded";
import {IsValid} from "@app/interfaces/IsValid";
import {MarkAsTouched} from "@app/interfaces/MarkAsTouched";
import {
    DropDownItem,
    QuoteState,
    QuoteSubjectivity, Subjectivity,
} from "@app/models";
import {
    SearchSubjectivitiesQuery
} from "@app/quote/models/subjectivity/subjectivity-configuration/SearchSubjectivitiesQuery";
import {SubjectivityService} from "@app/quote/services/subjectivity/subjectivity.service";
import {BaseStepComponent} from "@app/quote/steps/base-step.component";
import {SubjectivityFormErrors} from "@app/quote/steps/subjectivities-step/SubjectivityFormErrors";
import {Observable, of} from "rxjs";
import {flatMap, map, takeUntil} from "rxjs/operators";
import {LanguageService} from "@app/quote/services/language.service";
import {SubjectivityConfiguration} from "@app/models/subjectivity-configuration/SubjectivityConfiguration";
import {SearchSubjectivitiesResult} from "@app/models/subjectivity-configuration/SearchSubjectivitiesResult";

@Component({
    selector: "subjectivity-configuration-step",
    templateUrl: "subjectivity-configuration-step.component.html",
})
export class SubjectivityConfigurationStepComponent
    extends BaseStepComponent
    implements IsValid,
        IsDirty,
        IsLoaded,
        OnInit,
        OnChanges,
        OnDestroy,
        MarkAsTouched {
    public initialised: boolean = false;
    public currentDirection: string = "";
    public defaultDays = 14;
    public days: number = this.defaultDays;
    public selectedValue: string;
    public watchingErrors = false;
    public postDescription = "Post";
    public priorDescription = "Prior";
    private CUSTOM_SUBJECTIVITY_TYPE = "other";

    public oldDefaultSubjectivities: string[];

    @ViewChild(AutocompleteDropdown)
    public subjectivitySelector: AutocompleteDropdown;

    private readonly dirty: boolean = false;

    private availableSubjectivities: SubjectivityConfiguration[] = [];

    public defaultSubjectivitiesLoaded: boolean = true;
    @Input() public hasBeenInitialised: boolean;

    public isValid(): boolean {
        if (this.readonly) return true;

        const errors = this.checkValidation();
        return !errors;
    }

    public isLoaded(): boolean {
        return this.defaultSubjectivitiesLoaded;
    }

    public markAsTouched(): void {
        return;
    }

    public formErrors = new SubjectivityFormErrors();

    constructor(
        private readonly fb: FormBuilder,
        public subjectivityService: SubjectivityService,
        private readonly languageService: LanguageService
    ) {
        super();
    }

    public ngOnInit() {
        this.createForm();
        this.watchErrors();

        if (!this.currentDirection) {
            this.currentDirection = this.priorDescription;
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.vm && changes.vm.firstChange) {
            this.initialiseData();
        }
    }

    public isDirty(): boolean {
        return this.dirty;
    }

    get selectList(): Observable<any> {
        if (
            this.availableSubjectivities &&
            this.availableSubjectivities.length > 0
        ) {
            let filteredList = this.availableSubjectivities.filter(x => !this.vm.subjectivities.some(y => y.subjectivityUid === x.subjectivityId));
            const result = filteredList.map((item) => {
                let dropDownItem;
                if (item && item.text && item.subjectivityId) {
                    dropDownItem = new DropDownItem(
                        item.text,
                        item.subjectivityId.toString(),
                        null
                    );
                }
                return dropDownItem;
            });

            return of(result);
        }
    }

    private createForm() {
        this.stepForm = this.fb.group({
            selectedValue: [""],
            days: [""],
        });
    }

    private initialiseData() {
        if (!this.vm.removedAutoAttachedSubjectivities)
            this.vm.removedAutoAttachedSubjectivities = new Array<string>();
        if (!this.vm.subjectivities)
            this.vm.subjectivities = new Array<QuoteSubjectivity>();
        if (this.vm.state !== QuoteState.InProgress) {
            // The quote is not editable, we don't want to refresh the model/UI now
            return;
        }

        this.getMainSubjectivitiesData();
    }

    public getMainSubjectivitiesData() {

        this.subjectivityService
            .searchInSubjectivityConfiguration(this.vm)
            .subscribe((response: SearchSubjectivitiesResult[]) => {
                this.availableSubjectivities = response.map((subjectivityResponse) => {
                    return SubjectivityConfiguration.FromSearchSubjectivitiesResult(subjectivityResponse);
                });
            }, (errors) => {
                console.error(JSON.stringify(errors))
            }, () => {
                this.addAutoAttachingSubjectivities();
                this.setInitialise();
                this.removeInvalidSubjectivities();
                this.initialised = true;
            })
    }


    private addAutoAttachingSubjectivities() {
            this.availableSubjectivities.forEach((sub) => {
                if (sub.isAutoAttaching === true &&
                    !this.vm.removedAutoAttachedSubjectivities?.some(x => x === sub.subjectivityId) &&
                    !this.vm.subjectivities.some(x => x.subjectivityUid === sub.subjectivityId)) {
                    this.addSubjectivityToQuote(sub, true);
                }
            });

        this.defaultSubjectivitiesLoaded = true;
    }

    public chkChange(val: string): void {
        if (this.readonly) return;

        if (val === this.priorDescription) {
            this.days = 0;
        } else {
            this.days = this.defaultDays;
        }

        this.currentDirection = val;
        if (this.watchingErrors) {
            this.checkValidation();
        }
    }

    public addSubjectivity(): void {
        this.watchingErrors = true;
        if (!this.checkValidation()) {
            let id: string;
            let subjectivity: SubjectivityConfiguration;

            if (this.stepForm.value.selectedValue.value) {
                id = this.stepForm.value.selectedValue.value;
                subjectivity = this.availableSubjectivities.find(sub => sub.subjectivityId === id);
            } else {
                subjectivity = new SubjectivityConfiguration();
                subjectivity.text = this.stepForm.value.selectedValue;
                subjectivity.type = this.CUSTOM_SUBJECTIVITY_TYPE;
            }

            this.addSubjectivityToQuote(subjectivity);
            this.vm.removedAutoAttachedSubjectivities = this.vm.removedAutoAttachedSubjectivities.filter(x => x !== subjectivity.subjectivityId);

            // Now clear the form and remove the auto validate
            this.subjectivitySelector.clearSearch();
            this.currentDirection = this.priorDescription;
            this.days = this.days === 0 ? this.defaultDays : this.days;
            this.watchingErrors = false;
            this.buttonStatus = {
                canSaveAfterRecalculate: false,
                allowRecalculate: true,
            };
            this.setChange();
        }
    }

    public addSubjectivityToQuote(subjectivity: SubjectivityConfiguration, autoAttaching: boolean = false): void {
        if (!subjectivity) {
            return;
        }

        this.vm.subjectivities.push(this.getQuoteSubjectivity(subjectivity, autoAttaching));

        if (subjectivity.subjectivityId && this.subjectivitySelector) {
            this.subjectivitySelector.setOption(null);
        }
    }

    public onValueChanged(data): void {
        this.checkValidation();
    }

    private getQuoteSubjectivity(subjectivity: SubjectivityConfiguration, autoAttaching: boolean): QuoteSubjectivity {
        let isPost = this.currentDirection === this.postDescription;

        if (autoAttaching) {
            isPost = subjectivity.daysToResolve > 0;
            this.days = subjectivity.daysToResolve;
        }

        let quoteSubjectivity = new QuoteSubjectivity();
        quoteSubjectivity = {
            quoteSubjectivityId: 0,
            quoteId: 0,
            subjectivity: null,
            isPost,
            days: this.days,
            subjectivityUid: subjectivity.subjectivityId,
            text: subjectivity.text,
            type: subjectivity.type
        };

        return quoteSubjectivity;
    }

    private watchErrors(): void {
        this.stepForm.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((data) => this.onValueChanged(data));
        this.watchingErrors = true;
    }

    private removeInvalidSubjectivities() {
        let validSubjectivities = this.availableSubjectivities.map(x => x.subjectivityId);
        this.vm.subjectivities = this.vm.subjectivities.filter(x => (validSubjectivities.includes(x.subjectivityUid) || x.type === this.CUSTOM_SUBJECTIVITY_TYPE));
    }

    public checkValidation(): boolean {
        let errors = false;
        if (this.watchingErrors) {
            this.formErrors = new SubjectivityFormErrors();

            if (this.stepForm.controls.selectedValue.dirty) {
                if (!this.isTextSubjectivityTextUnique()) {
                    this.formErrors.subjectivity.push(
                        SubjectivityService.validationMessages.subjectivity
                            .unique
                    );
                    errors = true;
                }
            }

            if (!this.currentDirection || this.currentDirection === "") {
                this.formErrors.postprior.push(
                    SubjectivityService.validationMessages.postprior.required
                );
                errors = true;
            }

            if (
                this.stepForm.value.selectedValue &&
                this.stepForm.value.selectedValue !== ""
            ) {
                if (this.currentDirection === this.priorDescription) {
                    return errors;
                }

                if (this.days) {
                    if (parseInt(this.days.toString()) <= 0) {
                        this.formErrors.days.push(
                            SubjectivityService.validationMessages.days.over0
                        );
                        errors = true;
                    }
                } else {
                    if (parseInt(this.days.toString()) === 0) {
                        this.formErrors.days.push(
                            SubjectivityService.validationMessages.days.over0
                        );
                        errors = true;
                    } else {
                        this.formErrors.days.push(
                            SubjectivityService.validationMessages.days.required
                        );
                        errors = true;
                    }
                }
            }
        }
        return errors;
    }

    public isTextSubjectivityTextUnique(): boolean {
        const matchingSubjectivity = this.vm.subjectivities.find(
            (s) =>
                s.text.trim() ===
                (!this.stepForm.value.selectedValue.text
                    ? this.stepForm.value.selectedValue
                    : this.stepForm.value.selectedValue.text)
        );
        return !matchingSubjectivity;
    }

    public checkDaysFieldValidity(): boolean {
        return (
            this.formErrors.days.length > 0 &&
            this.stepForm.value.selectedValue &&
            this.stepForm.value.selectedValue !== "" &&
            this.currentDirection !== this.priorDescription
        );
    }

    public removeSubjectivity(index: number) {
        const subjectivityId = this.vm.subjectivities[index].subjectivityUid;
        this.vm.subjectivities.splice(index, 1);

        if (subjectivityId !== null) {

            this.availableSubjectivities.map((sub) => {
                if (sub.subjectivityId === subjectivityId && sub.isAutoAttaching) {
                    this.vm.removedAutoAttachedSubjectivities.push(subjectivityId);
                }
            });

            if (this.subjectivitySelector) {
                this.subjectivitySelector.setOption(null);
            }

            this.buttonStatus = {
                canSaveAfterRecalculate: false,
                allowRecalculate: true,
            };
            this.setChange();
        }
    }
}
