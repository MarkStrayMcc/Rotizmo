import {
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { AutocompleteDropdown } from "@app/components/autocomplete-dropdown";
import { SubjectivityAuthorisationState } from "@app/enums";
import { IsDirty } from "@app/interfaces/IsDirty";
import { IsLoaded } from "@app/interfaces/IsLoaded";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import {
    DropDownItem,
    QuoteState,
    QuoteSubjectivity,
    Subjectivity,
} from "@app/models";
import { SubjectivityFilterParameters } from "@app/quote/models/subjectivity/SubjectivityFilterParameters";
import { SubjectivityService } from "@app/quote/services/subjectivity/subjectivity.service";
import { BaseStepComponent } from "@app/quote/steps/base-step.component";
import { SubjectivityFormErrors } from "@app/quote/steps/subjectivities-step/SubjectivityFormErrors";
import { UserService } from "@app/services/user.service";
import { Observable, Subscriber } from "rxjs";
import { flatMap, takeUntil } from "rxjs/operators";

@Component({
    selector: "subjectivities-step",
    templateUrl: "subjectivities-step.component.html",
})
export class SubjectivitiesStepComponent
    extends BaseStepComponent
    implements
        IsValid,
        IsDirty,
        IsLoaded,
        OnInit,
        OnChanges,
        OnDestroy,
        MarkAsTouched
{
    public initialised: boolean = false;
    public currentDirection: string = "";
    public defaultDays = 14;
    public days: number = this.defaultDays;
    public selectedValue: string;
    public watchingErrors = false;
    public postDescription = "Post";
    public priorDescription = "Prior";

    public oldDefaultSubjectivities: number[];

    @ViewChild(AutocompleteDropdown)
    public subjectivitySelector: AutocompleteDropdown;

    private readonly dirty: boolean = false;

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
        private userService: UserService,
        public subjectivityService: SubjectivityService
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
            this.subjectivityService.getAvailableSubjectivities() &&
            this.subjectivityService.getAvailableSubjectivities().length > 0
        ) {
            const result = this.subjectivityService
                .getAvailableSubjectivities()
                .map((item) => {
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

            return Observable.create((observer: Subscriber<any>) => {
                observer.next(result);
                observer.complete();
            });
        }
    }

    private createForm() {
        this.stepForm = this.fb.group({
            selectedValue: [""],
            days: [""],
        });
    }

    private initialiseData() {
        if (!this.vm.removedDefaultSubjectivities)
            this.vm.removedDefaultSubjectivities = new Array<number>();
        if (!this.vm.subjectivities)
            this.vm.subjectivities = new Array<QuoteSubjectivity>();
        if (this.vm.state !== QuoteState.InProgress) {
            // The quote is not editable, we don't want to refresh the model/UI now
            return;
        }

        this.getMainSubjectivitiesData();
    }

    public getMainSubjectivitiesData() {
        const surplusBrokerId = this.vm.surplusLineBroker
            ? this.vm.surplusLineBroker.id
            : null;

        
            var subjectivityFilterParameters: SubjectivityFilterParameters = {
                productId: this.vm.product.productId,
                countryId: this.vm.client.primaryLocation.countryId,
                languageId: this.vm.languageId,
                surplusLineBrokerId: surplusBrokerId,
                authState: SubjectivityAuthorisationState.Authorised,
                isAdmitted: this.vm.product.isAdmitted,
            };

            this.subjectivityService
                .search(subjectivityFilterParameters)
                .pipe(
                    flatMap((approved: Subjectivity[]) => {
                        this.subjectivityService.setApprovedSubjectivities(
                            approved
                        );
                        return this.getDefaultSubjectivities();
                    })
                )
                .subscribe(
                    (defaults: Subjectivity[]) => {
                        if (defaults) {
                            this.setDefaultsubjectivities(defaults);
                        }
                    },
                    (errors) => {
                        console.error(JSON.stringify(errors));
                    },
                    () => {
                        this.addDefaultSubjectivities();
                        if (this.vm.shouldRemoveUnapprovedSubjectivities) {
                            this.removeSubjectivitiesNotAprroved();
                            this.vm.shouldRemoveUnapprovedSubjectivities =
                                false;
                        }
                        this.setAvailableSubjectivities();
                        this.setInitialise();
                        this.initialised = true;
                    }
                );
    }

    private removeSubjectivitiesNotAprroved(): void {
        if (
            this.subjectivityService.getApprovedSubjectivities() &&
            this.vm.subjectivities
        ) {
            const isInApproved = (subjectivity: Subjectivity) =>
                this.subjectivityService
                    .getApprovedSubjectivities()
                    .some(
                        (approved) =>
                            approved.subjectivityId ===
                            subjectivity.subjectivityId
                    );

            this.vm.subjectivities = this.vm.subjectivities.filter(
                (s) =>
                    s.subjectivity.subjectivityId === 0 || // TODO: investigate why it never actually is 0
                    isInApproved(s.subjectivity)
            );
        }
    }

    private setAvailableSubjectivities(): void {
        if (this.vm.subjectivities && this.vm.subjectivities.length > 0) {
            this.subjectivityService.setAvailableSubjectivities(
                this.subjectivityService
                    .getApprovedSubjectivities()
                    .filter(
                        (x) =>
                            !this.vm.subjectivities.some(
                                (y) =>
                                    y.subjectivity.subjectivityId.toString() ===
                                    x.subjectivityId.toString()
                            )
                    )
            );
        } else {
            this.subjectivityService.setAvailableSubjectivities(
                this.subjectivityService.getApprovedSubjectivities()
            );
        }
    }

    private getDefaultSubjectivities(): Observable<Subjectivity[]> {
        this.defaultSubjectivitiesLoaded = false;
        return this.subjectivityService.getDefaultSubjectivities(
            this.vm.draftQuoteId
        );
    }

    private setDefaultsubjectivities(result: Subjectivity[]): void {
        if (this.vm.defaultSubjectivities) {
            this.oldDefaultSubjectivities = this.vm.defaultSubjectivities.map(
                (x) => x.subjectivityId
            );
        }

        this.vm.defaultSubjectivities = result;
    }

    private addDefaultSubjectivities() {
        // Remove any default subjectivities that are not allowed by the current filter
        const allowedSubjectivityIds = this.subjectivityService
            .getApprovedSubjectivities()
            .map((x) => x.subjectivityId);
        this.vm.defaultSubjectivities = this.vm.defaultSubjectivities.filter(
            (a) => allowedSubjectivityIds.some((b) => b === a.subjectivityId)
        );

        // first need to remove any subjectivities that were auto added that are no longer in the default list
        if (this.oldDefaultSubjectivities) {
            const newDefaultSubjectivities = this.vm.defaultSubjectivities.map(
                (x) => x.subjectivityId
            );

            const toBeRemoved = this.oldDefaultSubjectivities.filter(
                (oldSub) => newDefaultSubjectivities.indexOf(oldSub) === -1
            );

            if (toBeRemoved.length > 0) {
                this.vm.subjectivities = this.vm.subjectivities.filter(
                    (x) =>
                        !toBeRemoved.some(
                            (r) => r === x.subjectivity.subjectivityId
                        )
                );
            }
        }

        this.vm.defaultSubjectivities.forEach((x) => {
            // We are checking if a default subjectivity is not already in the subjectivity list and is not in the removed defaults list
            const alreadyThere = this.vm.subjectivities.some(
                (sub) => sub.subjectivity.subjectivityId === x.subjectivityId
            );
            const alreadyRemoved = this.vm.removedDefaultSubjectivities.some(
                (y) => y.toString() === x.subjectivityId.toString()
            );

            if (!alreadyThere && !alreadyRemoved) {
                this.insertSubjectivity(x.subjectivityId, x.text, true);
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
            let id: number;
            let subText: string;

            if (this.stepForm.value.selectedValue.value) {
                id = this.stepForm.value.selectedValue.value;
                subText = this.stepForm.value.selectedValue.text;
            } else {
                id = 0;
                subText = this.stepForm.value.selectedValue;
            }

            this.insertSubjectivity(id, subText);

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

    public insertSubjectivity(
        id: number | string,
        subText: string,
        isDefault: boolean = false
    ) {
        const isPost =
            this.currentDirection === this.postDescription ||
            (isDefault &&
                !SubjectivityService.priorBindDefaultSubjectivities.includes(
                    id
                ));

        const quoteSubjectivity: QuoteSubjectivity = {
            quoteSubjectivityId: 0,
            quoteId: 0,
            subjectivity: {
                subjectivityId: id,
                text: subText,
            } as Subjectivity,
            isPost,
            days: isPost ? (isDefault ? this.defaultDays : this.days) : 0,
        };

        if (
            parseInt(id.toString()) ===
            SubjectivityService.incidentResponseAppSubjectivityId
        ) {
            quoteSubjectivity.days =
                SubjectivityService.incidentResponseAppSubjectivityDays;
            quoteSubjectivity.isPost = true;
        }

        this.vm.subjectivities.push(quoteSubjectivity);

        if (id !== 0) {
            // need to remove from available entries
            if (this.subjectivityService.getAvailableSubjectivities()) {
                this.subjectivityService.setAvailableSubjectivities(
                    this.subjectivityService
                        .getAvailableSubjectivities()
                        .filter((obj) => obj.subjectivityId.toString() !== id.toString())
                );
            }

            if (this.subjectivitySelector) {
                this.subjectivitySelector.setOption(null);
            }
        }
    }

    public onValueChanged(data): void {
        this.checkValidation();
    }

    private watchErrors(): void {
        this.stepForm.valueChanges
            .pipe(takeUntil(this.destroyed$))
            .subscribe((data) => this.onValueChanged(data));
        this.watchingErrors = true;
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
                s.subjectivity.text.trim() ===
                (!this.stepForm.value.selectedValue.text
                    ? this.stepForm.value.selectedValue
                    : this.stepForm.value.selectedValue.text)
        );
        if (matchingSubjectivity) {
            return false;
        }

        return true;
    }

    public checkDaysFieldValidity(): boolean {
        return (
            this.formErrors.days.length > 0 &&
            this.stepForm.value.selectedValue &&
            this.stepForm.value.selectedValue !== "" &&
            this.currentDirection !== this.priorDescription
        );
    }

    // move to subjectivity service!!!!
    public removeSubjectivity(index: number) {
        const idRemoved =
            this.vm.subjectivities[index].subjectivity.subjectivityId;
        this.vm.subjectivities.splice(index, 1);

        if (idRemoved !== 0) {
            // need to put it back in the available list in case they removed it by mistake
            let removed = this.subjectivityService
                .getApprovedSubjectivities()
                .filter((obj) => obj.subjectivityId.toString() === idRemoved.toString())[0];

            if (!removed) {
                removed = this.vm.defaultSubjectivities.filter(
                    (obj) => obj.subjectivityId.toString() === idRemoved.toString()
                )[0];
            }

            if (
                this.vm.defaultSubjectivities.some(
                    (s) => s.subjectivityId === removed.subjectivityId
                )
            ) {
                this.vm.removedDefaultSubjectivities.push(
                    removed.subjectivityId
                );
            }

            if (this.subjectivityService.getAvailableSubjectivities()) {
                this.subjectivityService.setAvailableSubjectivities([
                    ...this.subjectivityService.getAvailableSubjectivities(),
                    removed,
                ]);
            } else {
                this.subjectivityService.setAvailableSubjectivities([removed]);
            }

            // now re-sort to alphabetical
            this.subjectivityService
                .getAvailableSubjectivities()
                .sort((n1, n2) => {
                    if (n1.text > n2.text) {
                        return 1;
                    }

                    if (n1.text < n2.text) {
                        return -1;
                    }

                    return 0;
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
