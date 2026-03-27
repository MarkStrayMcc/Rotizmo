
import { Component, EventEmitter, forwardRef, Input, Output } from "@angular/core";
import {
    AbstractControl, ControlValueAccessor,
    NG_VALIDATORS, NG_VALUE_ACCESSOR,
    ValidationErrors, Validator
} from "@angular/forms";
import { QuoteSubjectivity } from "@app/models";
import { QuoteSubjectivityService } from "@app/services/quote-subjectivity.service";

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BindQuoteSubjectivitiesStepComponent)
        },
        {
            multi: true,
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => BindQuoteSubjectivitiesStepComponent)
        }
    ],
    selector: "bind-quote-subjectivities-step",
    styleUrls: ["./bind-quote-subjectivities-step.component.scss"],
    templateUrl: "./bind-quote-subjectivities-step.component.html"
})
export class BindQuoteSubjectivitiesStepComponent implements ControlValueAccessor, Validator {
    @Input() public showOnlyPostError = false;

    @Output() public changed = new EventEmitter();

    private subjectivities: QuoteSubjectivity[] = [];
    private onChange: (data: any) => void;
    private onTouched: (data: any) => void;
    private readonly defaultNumberOfDaysPost: number = 14;

    constructor(private readonly quoteSubjectivityService: QuoteSubjectivityService) { }

    public writeValue(obj: any) {
        this.subjectivities = obj;
    }

    public registerOnChange(fn: any) {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    public validate(c: AbstractControl): ValidationErrors {
        if (this.priorSubjectivities.length > 0) {
            return { onlyPost: { valid: false } };
        }

        return null;
    }

    public get priorSubjectivities(): QuoteSubjectivity[] {
        return this.subjectivities.filter((s) => !s.isPost);
    }

    public get postSubjectivities(): QuoteSubjectivity[] {
        return this.subjectivities.filter((s) => s.isPost);
    }

    public getSubjectivityDisplayText(subjectivity: QuoteSubjectivity) {
        return this.quoteSubjectivityService.formatSubjectivityDisplayText(subjectivity);
    }

    public deleteSubjectivity(subjectivity: QuoteSubjectivity) {
        const index = this.subjectivities.findIndex((sub) => sub === subjectivity);

        if (index !== -1) {
            this.subjectivities.splice(index, 1);
            this.onTouched(this.subjectivities);
            this.onChange(this.subjectivities);
            this.changed.emit(this.subjectivities);
        }
    }

    public flipSubjectivity(subjectivity: QuoteSubjectivity) {
        this.onTouched(this.subjectivities);

        if (subjectivity.isPost) {
            return;
        }

        const numberOfDaysPost = this.getHighestNumberOfDaysPostBinding();

        subjectivity.isPost = true;
        subjectivity.days = numberOfDaysPost;
        this.onChange(this.subjectivities);
        this.changed.emit(this.subjectivities);
    }

    private getHighestNumberOfDaysPostBinding(): number {
        if (this.postSubjectivities.length) {
            return Math.max.apply(Math, this.postSubjectivities.map((subjectivity) => subjectivity.days));
        }

        return this.defaultNumberOfDaysPost;
    }
}
