import { Component, forwardRef } from "@angular/core";

import { Observable } from "rxjs";

import { FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { RiskQuestionOption } from "@app/models";
import { BaseRiskQuestionValueAccessor } from "@app/quote/components/risk/base-risk-question/base-risk-question-value-accessor.component";
import { map } from "rxjs/operators";

@Component({
    selector: "searchable-dropdown",
    templateUrl: "./searchable-dropdown.component.html",
    styleUrls: ["./searchable-dropdown.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchableDropdownComponent),
            multi: true
        }
    ]
})
export class SearchableDropdownComponent extends BaseRiskQuestionValueAccessor<string> {
    public filteredOptions: Observable<RiskQuestionOption[]>;
    private regExpSpecialCharacters: RegExp = /[-[\]{}()*+?.\\^$|#\s]/g;

    public disabled: boolean = false;

    protected initControl() {
        this.formControl = new FormControl({ value: null });
        this.valueChangesSubscription = this.formControl.valueChanges.subscribe(value => this.valueChangehandler(value));
        this.setupDropDown();
    }

    public writeValue(value: string): void {
        const riskSelectionOption = this.riskQuestion.options
            .find(x => x.uid === value);

        this.formControl.setValue(riskSelectionOption);
    }

    public displayFn(item: any): string {
        if (typeof (item) === "string") {
            return item.toString();
        } else {
            return item ? item.text : "";
        }
    }

    private setupDropDown(): void {
        this.filteredOptions = this.formControl.valueChanges
            .pipe(
                map(option => {
                    if (option && typeof option === "object") {
                        return (option as RiskQuestionOption).text;
                    } else {
                        return option;
                    }
                }),
                map(name => {
                    if (name) {
                        return this.filter(name);
                    }

                    if (this.riskQuestion.options) {
                        return this.riskQuestion.options.slice();
                    }

                    return null;
                }));
    }

    private valueChangehandler(value: RiskQuestionOption) {
        const riskSelectOptionId = value ? value.uid : null;

        this.onChangeEvent(riskSelectOptionId);
    }

    private filter(name: string) {
        if (name && name.length > 0) {
            name = name.replace(this.regExpSpecialCharacters, "\\$&");
            return this.riskQuestion.options.filter(option => new RegExp(`^.*${name}.*`, "gi").test(option.text));
        } else {
            return this.riskQuestion.options;
        }
    }
}
