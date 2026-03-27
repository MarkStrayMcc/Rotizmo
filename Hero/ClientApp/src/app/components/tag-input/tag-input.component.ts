import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
    selector: 'tag-input',
    templateUrl: './tag-input.component.html',
    styleUrls: ['./tag-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TagInputComponent),
            multi: true
        }
    ]
})
/** tag-input component*/
export class TagInputComponent implements ControlValueAccessor {

    // Enter, comma = 188, space
    separatorKeysCodes = [ENTER, 188, SPACE];
    private onChangeEvent: any;
    private onBlurEvent: any;
    public disabled: boolean = false;
    @Input() placeholder: string = '';
    @Input() addOnBlur: boolean = true;
    // regex if you want to allow multiple of items
    @Input() multiRegex: string;
    // regex if you only want to allow one of an item and nothing else
    @Input() singleRegex: string;
    @Input() allowDuplicates: boolean = false;
    @Input() smallWidth: boolean = false;
    @Input() allCaps: boolean = false;

    private singleTagRegex: RegExp;
    private multiTagRegex: RegExp;

    writeValue(obj: any): void {
        this.tagValues = obj;
    }

    registerOnChange(fn: any): void {
        this.onChangeEvent = fn;
    }
    registerOnTouched(fn: any): void {
        this.onBlurEvent = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public tagValues = [
    ];

    public ngOnChanges(changes: any): void {
        if (changes) {
            if (changes.multiRegex && changes.multiRegex.firstChange && this.multiRegex) {
                this.multiTagRegex = new RegExp(this.multiRegex, "i");
            }
            if (changes.singleRegex && changes.singleRegex.firstChange && this.singleRegex) {
                this.singleTagRegex = new RegExp(this.singleRegex, "i");
            }
            if (changes.smallWidth) {
                this.smallWidth = coerceBooleanProperty(this.smallWidth);
            }
            if (changes.allCaps) {
                this.allCaps = coerceBooleanProperty(this.allCaps);
            }
        }
    }

    public checkAndAddTag(text: string) {
        // Add our tag if it passes the regex checks (or no regex exists)
        if ((text || '').trim()) {
            let tag = text.trim();
            if (this.allCaps) {
                tag = tag.toUpperCase();
            }

            if (!this.allowDuplicates) {
                if (this.tagValues.indexOf(tag) >= 0) {
                    return;
                }
            }

            if (!this.containsOneFromSingleRegex()) {
                if (this.multiTagRegex) {
                    if (this.multiTagRegex.test(tag)) {
                        this.tagValues.push(tag);
                    }
                }

                if (this.singleTagRegex && this.tagValues.length === 0) {
                    if (this.singleTagRegex.test(tag)) {
                        this.tagValues.push(tag);
                    }
                }
            }

            if (!this.multiTagRegex &&
                !this.singleTagRegex) {
                this.tagValues.push(tag);
            }
        }
    }

    public add(event: MatChipInputEvent) {
        let input = event.input;
        let value = event.value;

        this.checkAndAddTag(value);

        // Reset the input value
        if (input) {
            input.value = "";
        }

        if (this.onChangeEvent) {
            this.onChangeEvent(this.tagValues);
        }
    }

    private containsOneFromSingleRegex(): boolean {
        return this.singleTagRegex && this.tagValues.length === 1 &&
            this.singleTagRegex.test(this.tagValues[0]);
    }

    public remove(tag: string) {
        let index = this.tagValues.indexOf(tag);

        if (index >= 0) {
            this.tagValues.splice(index, 1);
        }

        if (this.onChangeEvent) {
            this.onChangeEvent(this.tagValues);
        }
    }

    public blurred() {
        if (this.onBlurEvent) {
            this.onBlurEvent();
        }
    }
}