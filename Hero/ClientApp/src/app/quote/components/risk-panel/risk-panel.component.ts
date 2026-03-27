import { AfterViewInit, Component, EventEmitter, forwardRef, Injector, Input, OnChanges, OnDestroy, Output, SimpleChanges } from "@angular/core";
import { ControlValueAccessor, FormGroup, NgControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from "@angular/forms";
import { ActivityMap, Quote, RiskQuestion, RiskQuestionAnswer, RiskQuestionType } from "@app/models";
import { RiskQuestionValidationRulesSearchRequest } from "@app/quote/models/RiskQuestionValidationRulesSearchRequest";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { RiskPanelFormBuilder } from "@app/services/risk-panel-form-builder";
import { RiskPanelFormHandler } from "@app/services/risk-panel-form-handler";
import { UnderwriterRiskValidationService } from "@app/services/UnderwriterValidation/underwriter-risk-validation.service";
import { UserAuthorityHttpService } from "@app/services/user-authority-http.service";
import { UserService } from "@app/services/user.service";
import { isEqual } from "lodash";
import { Subscription } from "rxjs";
import { RiskQuestionValidationHandler } from "../risk/risk-form-validation-handler/risk-question-validation-handler";
import { RiskPanelWarningsHandler } from "./risk-panel-warnings-handler/risk-panel-warnings-handler";
import { RiskQuestionDependencyHandler } from "./risk-question-dependency-handler/risk-question-dependency-handler";

@Component({
    selector: "risk-panel",
    templateUrl: "risk-panel.component.html",
    styleUrls: ["risk-panel.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RiskPanelComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => RiskPanelComponent),
            multi: true
        }
    ]
})
export class RiskPanelComponent
    implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor, Validator {

    public form: FormGroup;
    public type = RiskQuestionType;
    protected onChangeHandler: (value: RiskQuestionAnswer[]) => void = (_: any) => { };
    protected onTouchedHandler: () => void = () => { };
    protected onValidatorChangeHandler: () => void = () => { };

    private questions: RiskQuestion[];
    private riskQuestionAnswers: RiskQuestionAnswer[];
    private valueChangesSubscription: Subscription;
    private statusChangesSubscription: Subscription;
    private isDisabled: boolean = false;
    private currencyRiskQuestionsToValidateAuthority = ["TOTAL_REVENUE"];

    get riskQuestions() {
        return this.questions;
    }

    @Input()
    set riskQuestions(questions: RiskQuestion[]) {
        this.questions = questions;
        this.replaceVariables(questions);
    }

    @Input() public quote: Quote;
    @Input() public isRiskStep: boolean;

    @Output() public onWarningChange = new EventEmitter<boolean>();

    constructor(
        private readonly injector: Injector,
        public readonly riskPanelFormBuilder: RiskPanelFormBuilder,
        private readonly riskQuestionValidationHandler: RiskQuestionValidationHandler,
        public readonly binderValidationService: BinderValidationService,
        private readonly riskPanelWarningsHandler: RiskPanelWarningsHandler,
        private readonly userService: UserService,
        private readonly userAuthorityHttpService: UserAuthorityHttpService,
        private readonly underwriterRiskValidationService: UnderwriterRiskValidationService
    ) {
    }

    public ngAfterViewInit() {
        const ngControl = this.injector.get(NgControl, null);

        if (ngControl) {
            ngControl.control.markAsTouched =
                () => Object.keys(this.form.controls)
                    .forEach(key => this.form.get(key).markAsTouched());
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.riskQuestions) {
            if (this.isRiskStep) {
                this.checkRiskQuestionAuthority();
            }

            if (changes.riskQuestions.firstChange && this.riskQuestions) {
                this.form = this.riskPanelFormBuilder.buildForm(this.riskQuestions, this.riskQuestionAnswers);
            }

            const areRiskQuestionChangesEqual = isEqual(changes.riskQuestions.previousValue, changes.riskQuestions.currentValue);
            if (!changes.riskQuestions.firstChange && !areRiskQuestionChangesEqual) {
                this.setupForm();
                this.setupValueChangesSubscription();
                this.setupStatusChangesSubscription();
                this.binderValidationService.initialiseBindersCriteriaValidation(this.quote);
                new RiskQuestionDependencyHandler(this.riskQuestions, this.riskQuestionAnswers).setVisibilityForRiskQuestions();
            }
        }
    }

    public ngOnDestroy(): void {
        if (this.valueChangesSubscription) this.valueChangesSubscription.unsubscribe();
        if (this.statusChangesSubscription) this.statusChangesSubscription.unsubscribe();
    }

    public writeValue(riskQuestionAnswers: RiskQuestionAnswer[]): void {
        this.riskQuestionAnswers = riskQuestionAnswers;
    }

    public registerOnChange(onChangeHandler: (value: RiskQuestionAnswer[]) => void): void {
        this.onChangeHandler = onChangeHandler;
    }

    public registerOnTouched(onTouchedHandler: () => void): void {
        this.onTouchedHandler = onTouchedHandler;
    }

    public setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        if (this.form) {
            if (isDisabled) {
                this.form.disable({ emitEvent: false });
            } else {
                this.form.enable({ emitEvent: false });
            }
        }
    }

    public validate(): ValidationErrors {
        if (!this.form ||
            this.riskQuestions
                .filter(question => question.isVisible)
                .map(question => this.form.controls[question.tag])
                .some(control => control.invalid)) {
            return { error: "Invalid risk questions" };
        }

        return {};
    }

    public registerOnValidatorChange?(onValidatorChangeHandler: () => void): void {
        this.onValidatorChangeHandler = onValidatorChangeHandler;
    }

    public displayValidationForRiskQuestion(tag: string): boolean {
        const control = this.form.get(tag);
        return control.invalid && (control.dirty || control.touched);
    }

    public displayWarningForRiskQuestion(riskQuestion: RiskQuestion): boolean {
        const warning = this.riskPanelWarningsHandler.checkWarningForRiskQuestion(riskQuestion.tag);
        return warning && !this.displayValidationForRiskQuestion(riskQuestion.tag);
    }

    public getValidationMessagesForQuestion(tag: string): string {
        const errors = this.form.get(tag).errors;
        return this.riskQuestionValidationHandler.getValidationMessages(errors);
    }

    public checkRiskQuestionAuthority() {
        const userRoleId: number = this.userService.getUserFirstRole();
        if (userRoleId > 0) {
            const selectedActivities: ActivityMap[] = this.underwriterRiskValidationService.setSelectedActivities();

            this.currencyRiskQuestionsToValidateAuthority.forEach((riskQuestionTag) => {
                const riskQuestionValidationRequest: RiskQuestionValidationRulesSearchRequest = {
                    riskQuestionTag: riskQuestionTag,
                    activityCodes: selectedActivities.map(activity => activity.code),
                    authorityRoleId: userRoleId,
                    productCode: this.quote.product.productName
                }

                this.userAuthorityHttpService.getRiskQuestionValidationRulesByActivities(riskQuestionValidationRequest)
                    .subscribe(riskQuestionActivityValidation => {
                        this.underwriterRiskValidationService.setRiskQuestionActivityValidation(riskQuestionActivityValidation);
                    });
            });
        }
    }

    public setupForm(): void {
        const form = this.riskPanelFormBuilder.buildForm(this.riskQuestions, this.riskQuestionAnswers);

        if (this.form) {
            Object.keys(form.controls).forEach(key => {
                if (this.form.get("key")) {
                    this.form.setControl(key, form.get(key));
                } else {
                    this.form.addControl(key, form.get(key));
                }
            });
        } else {
            this.form = form;

            if (this.isDisabled) {
                this.form.disable();
            }
        }
    }

    public setupValueChangesSubscription(): void {
        if (this.valueChangesSubscription) {
            this.valueChangesSubscription.unsubscribe();
        }

        this.valueChangesSubscription = new RiskPanelFormHandler(this.form, this.riskQuestions).answers
            .subscribe(answers => this.riskQuestionAnswerChangeHandler(answers));
    }

    public setupStatusChangesSubscription(): void {
        if (this.statusChangesSubscription) {
            this.statusChangesSubscription.unsubscribe();
        }

        this.statusChangesSubscription = this.form.statusChanges
            .subscribe(this.onValidatorChangeHandler);
    }

    private riskQuestionAnswerChangeHandler(answers: RiskQuestionAnswer[]): void {
        if (this.form.enabled) {
            this.riskQuestionAnswers = answers;
            new RiskQuestionDependencyHandler(this.riskQuestions, this.riskQuestionAnswers).setVisibilityForRiskQuestions();
            this.onValidatorChangeHandler();
            this.binderValidationService.filterBindersCriteriaBasedOnRevenueFirst(this.quote);

            const warnings = this.riskPanelWarningsHandler.checkWarnings();
            this.onWarningChange.emit(warnings);

            if (this.form.dirty) {
                this.onChangeHandler(this.riskQuestionAnswers);
            }
        }
    }

    private replaceVariables(questions: RiskQuestion[]) {
        if (!questions) {
            return;
        }
        questions.forEach((q: RiskQuestion) => {
            q.label = q.label.replace("[[ccy]]", this.quote.currency.symbol);
        });
    }
}
