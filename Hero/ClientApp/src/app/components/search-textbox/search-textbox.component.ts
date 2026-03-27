import { Component, Input, forwardRef } from "@angular/core";
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

@Component({
    selector: 'search-textbox',
    templateUrl: './search-textbox.component.html',
    styleUrls: ['./search-textbox.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchTextBoxComponent),
            multi: true
        }
    ]
})
export class SearchTextBoxComponent implements ControlValueAccessor {
    writeValue(obj: any): void {
    }
    registerOnChange(fn: any): void {
    }
    registerOnTouched(fn: any): void {
    }
    setDisabledState?(isDisabled: boolean): void {
    }

    @Input() public myControl: FormControl;

    constructor() { }

    ngOnInit() {
    }

}
