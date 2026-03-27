import {
    Component,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { IsDirty } from "@app/interfaces/IsDirty";
import { IsLoaded } from "@app/interfaces/IsLoaded";
import { IsValid } from "@app/interfaces/IsValid";
import { MarkAsTouched } from "@app/interfaces/MarkAsTouched";
import { Quote, QuoteState } from "@app/models";
import { ActivityListComponent } from "@app/quote/components/activities/activity-list/activity-list.component";
import { BaseStepComponent } from "@app/quote/steps/base-step.component";
import { UnderwriterActivityValidationService } from "@app/services/UnderwriterValidation/underwriter-activity-validation.service";
import { Subscription } from "rxjs";



@Component({
    selector: "activities-step",
    templateUrl: "activities-step.component.html",
    styleUrls: ["activities-step.component.scss"],
})
export class ActivitiesStepComponent
    extends BaseStepComponent
    implements
        IsValid,
        IsDirty,
        IsLoaded,
        MarkAsTouched,
        OnInit,
        OnChanges,
        OnDestroy
{
    public descriptionOfBusiness: FormControl;
    public valid: boolean = true;
    public dirty: boolean = false;
    public validateDescription: boolean = false;
    public validatePercentage: boolean = false;
    @ViewChild(ActivityListComponent)
    public activityList: ActivityListComponent;
    public activityListVm: Quote;

    private isLoading: boolean = true;

    public isValid(): boolean {
        if (this.readonly) {
            return true;
        }

        return this.valid && this.activityList.isValid();
    }

    public isLoaded(): boolean {
        return !this.isLoading;
    }

    public markAsTouched(): void {
        this.validateDescription = true;
        this.validatePercentage = true;
        this.onValueChanged(true);
    }

    public formErrors = {
        descriptionOfBusiness: [],
    };

    public validationMessages = {
        descriptionOfBusiness: {
            required: "Required",
        },
    };

    private valueChangeSubscription: Subscription;

    constructor(
        private readonly fb: FormBuilder,
        private underwriterActivityValidationService: UnderwriterActivityValidationService
    ) {
        super();
    }

    public onDescriptionBlur(): void {
        this.validateDescription = true;
    }

    public ngOnInit() {
        this.stepForm = this.fb.group({
            descriptionOfBusiness: ["", Validators.required],
        });

        this.valueChangeSubscription = this.stepForm.valueChanges.subscribe(
            (data) => this.onValueChanged()
        );
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.vm && changes.vm.firstChange) {
            this.activityListVm = this.vm;
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.valueChangeSubscription) {
            this.valueChangeSubscription.unsubscribe();
        }
    }

    public isDirty(): boolean {
        return this.dirty;
    }

    public get productId(): number {
        return this.vm.product.productId;
    }

    public get productName(): string {
        return this.vm.product.productDisplay;
    }

    public onActivitiesChange() {
        this.buttonStatus = {
            canSaveAfterRecalculate: false,
            allowRecalculate: true,
        };
        this.setChange();
        if (this.vm.state < QuoteState.Approved) {
            this.setWarning(
                this.underwriterActivityValidationService.doActivityDetailsHaveWarning(
                    this.vm.activities
                )
            );
        }
    }

    public onActivityListLoad(): void {
        this.isLoading = false;
    }

    private onValueChanged(touched?: boolean) {
        if (!this.stepForm) {
            return;
        }
        const form = this.stepForm;
        this.valid = true;

        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                // clear previous error message (if any)
                this.formErrors[field] = [];
                const control = form.get(field);

                if (control && !control.valid) {
                    this.valid = false;
                    const messages = this.validationMessages[field];
                    for (const key in control.errors) {
                        if (control.errors.hasOwnProperty(key)) {
                            this.formErrors[field].push(messages[key]);
                            if (!control.touched && touched) {
                                control.markAsTouched();
                            }
                        }
                    }
                }
            }
        }
    }
}
