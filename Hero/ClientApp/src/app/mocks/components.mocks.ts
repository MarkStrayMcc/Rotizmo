import { Input, Component, EventEmitter, Output, forwardRef, Directive } from "@angular/core";
import { AbstractControl, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Currency } from "@app/models";
import { CarrierContribution } from "@app/services/finance/add-transaction-modal/models/CarrierContribution";

@Component({ selector: "error", template: "" })
export class MockErrorComponent {
    @Input() public formCtrl: AbstractControl = new FormControl();
    @Input() public errorText = { Required: "Field required" };
}

@Component({ selector: "datepicker", template: "" })
export class MockDatePickerComponent {
    @Input() public minimumDate: string;
    @Input() public maximumDate: string;
    @Input() public readonly = false;
}

@Component({
    selector: "currency",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockCurrencyComponent),
            multi: true
        }
    ]
})
export class MockCurrencyComponent implements ControlValueAccessor {
    @Input() public inputName = "currency";
    @Input() public isRequired = false;
    @Input() public hasWarning = false;
    @Input() public warningText: string;
    @Input() public decimals = false;
    @Input() public negatives = false;
    @Input() public readonly = false;
    @Input() public currency: Currency = {
        id: 1,
        symbol: "£",
        isoCode: "GBP",
        name: "pound",
        rate: 1.0
    };
    @Input() public value: any;
    @Output() public valueChange = new EventEmitter<number>();
    @Output() public focus = new EventEmitter<boolean>();

    public writeValue(obj) { return; }
    public registerOnChange(fn) { return; }
    public registerOnTouched(fn) { return; }
}

@Component({ selector: "message", template: "" })
export class MockMessageComponent { }

@Component({ selector: "loading-spinner", template: "" })
export class MockLoadingSpinnerComponent { }

@Component({ selector: "carrier-contributions", template: "" })
export class MockCarrierContributionsComponent {
    @Input() carrierContributions: CarrierContribution[];
}

@Directive({ selector: "[LargeNumber]" })
export class MockLargeNumberMask {
    @Input() public allowDecimals: boolean = null;
    @Input() public initialValue: number;
    @Output() public onValueChanged = new EventEmitter<number>();
}

@Component({
    selector: "autocomplete-dropdown",
    template: ""
})
export class MockAutocompleteDropdown {
    @Input() public myControl;
    @Input() public dataSource;
    @Input() public placeholderText;
    @Input() public isValid;
    @Input() public selectedValue;
    @Input() public customDisplayMethod;
}


@Component({
    selector: "tag-input",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockTagInputComponent),
            multi: true
        }
    ]
})
export class MockTagInputComponent implements ControlValueAccessor {
    @Input() public placeholder = "";
    @Input() public addOnBlur = true;
    @Input() public multiRegex: string;
    @Input() public singleRegex: string;
    @Input() public allowDuplicates: boolean;
    @Input() public smallWidth = false;
    @Output() public allCaps = false;

    public writeValue(obj) { return; }
    public registerOnChange(fn) { return; }
    public registerOnTouched(fn) { return; }
}

@Component({
    selector: "percentage-input",
    template: "<p>Mock Percentage Input Component</p>",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockPercentageInputComponent),
            multi: true
        }
    ]
})
export class MockPercentageInputComponent implements ControlValueAccessor {
    set value(val) {
        this.val = val;
        this.onChange(val);
        this.onTouch(val);
    }
    val = "";
    onChange: any = () => { };
    onTouch: any = () => { };
    writeValue(value: any) { this.value = value; }
    registerOnChange(fn: any) { this.onChange = fn; }
    registerOnTouched(fn: any) { this.onTouch = fn; }
}
