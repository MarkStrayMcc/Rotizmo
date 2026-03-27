import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

@Component({
    selector: 'autocomplete-multiselect',
    templateUrl: './autocomplete-multiselect.component.html',
    styleUrls: ['./autocomplete-multiselect.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutocompleteMultiselectComponent),
            multi: true
        }
    ]
})

export class AutocompleteMultiselectComponent implements OnInit, ControlValueAccessor {
    @Input() public formCtrl: AbstractControl;
    @Input() public placeholder: string = '';
    @Input() public options: any[];
    @Input() public displayName: (obj: any) => string;
    @Input() public dropDownDisplay: (obj: any) => string;
    @Input() public autoShowOnFocus: boolean = false;
    @Input()
    set value(val) {
        this.selectedOptions = val;
        if (this.changeEvent) {
            this.changeEvent(val);
        }
        this.valueChange.emit(this.selectedOptions);
    }

    get value(): any[] {
        let rawElementText = (this.input.nativeElement as HTMLInputElement).value;
        if (rawElementText !== "") {
            return this.selectedOptions.concat(rawElementText);
        } else {
            return this.selectedOptions;
        }
    }
    
    @Output() public valueChange = new EventEmitter<any[]>();
    
    @ViewChild('input', { read: MatAutocompleteTrigger }) autoTrigger: MatAutocompleteTrigger;
    @ViewChild('input', { static: true }) input: ElementRef;
    
    public myControl = new FormControl();
    public selectedOptions: any[] = [];
    public filteredOptions: Observable<any[]>;

    private regExpSpecialCharacters = /[-[\]{}()*+?.\\^$|#\s]/g;
    private changeEvent: any;
    private touchEvent: any;

    constructor(private changeDetector: ChangeDetectorRef) { }

    public writeValue(obj: any): void {
        this.value = obj;
    }

    public registerOnChange(fn: any): void {
        this.changeEvent = fn;
    }

    public registerOnTouched(fn: any): void {
        this.touchEvent = fn;
    }

    public blurred() {
        if (this.touchEvent) {
            this.touchEvent();
        }
    }

    public display(obj: any): string {
        return this.displayName(obj);
    }

    public dropdown(obj: any): string {
        return this.dropDownDisplay(obj);
    }

    public removeOption(option, event: MouseEvent) {
        const index = this.selectedOptions.findIndex(x => this.dropDownDisplay(x) === this.dropDownDisplay(option));
        if (index >= 0) {
            this.selectedOptions.splice(index, 1);
        }

        if (this.touchEvent) {
            this.touchEvent();
        }

        if (this.changeEvent) {
            this.changeEvent(this.selectedOptions);
        }

        this.changeDetector.detectChanges();
        this.input.nativeElement.focus();
        this.autoTrigger._onChange("");
        event.stopPropagation();
    }

    public ngOnInit() {
        this.filteredOptions = this.myControl.valueChanges.pipe(
            debounceTime(500),
            map(val => this.filter(val)
            ));
    }

    public onClick() {
        this.forceDropdownShow();
    }

    public onFocus() {
        if (coerceBooleanProperty(this.autoShowOnFocus)) {
            this.forceDropdownShow();
        }
    }

    public get unselectedOptions(): any[] {
        if (this.options && this.options.length !== 0) {
            return this.options
                .filter(option =>
                    this.selectedOptions.findIndex(selectedOption =>
                        this.dropDownDisplay(selectedOption) === this.dropDownDisplay(option)) < 0);
        }

        return null;
    }

    public filter(val: string): any[] {
        if (this.changeEvent) {
            this.changeEvent(this.value);
        }

        if (this.options && this.options.length !== 0) {
            let unselectedOptions = this.unselectedOptions;

            if (val && val.length > 0) {
                val = val.replace(this.regExpSpecialCharacters, '\\$&');

                let filteredOptions = unselectedOptions.filter(option => new RegExp(`^.*${val}.*`, 'gi').test(this.dropDownDisplay(option)));
                return filteredOptions.slice(0, 100);
            } else {
                return unselectedOptions.slice(0, 100);
            }
        }
        return null;
    }

    public selected(option: any) {
        this.selectedOptions.push(option);
        if (this.changeEvent) {
            this.changeEvent(this.selectedOptions);
        }

        (this.input.nativeElement as HTMLInputElement).value = '';
    }

    private forceDropdownShow() {
        this.input.nativeElement.focus();
        this.autoTrigger._onChange("");
        this.autoTrigger.openPanel();
    }
}
