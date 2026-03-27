import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { Directive, EventEmitter, HostListener, Input, OnInit, Output } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
    selector: "[largeNumber]"
})
export class LargeNumberMask implements OnInit {
    constructor(public model: NgControl) { }

    private threeNumberRegx = /[0-9]{3}/mig;
    private nonNumRegx = /\D/g;

    @Input() public allowNegative: boolean = false;
    @Input() public allowDecimals: boolean = null;
    @Input() public initialValue: number;
    @Output() public onValueChanged = new EventEmitter<number>();

    public ngOnInit() {
        if (this.initialValue || this.initialValue === 0) {
            this.onInputChange(this.initialValue, null);
        } else {
            // TODO: verify if this can be safely omitted as we should be using reactive forms
            //  and setting default values with form group/control set method.
            // this.onInputChange("", null);
        }
    }

    @HostListener("ngModelChange", ["$event"])
    public onInputChange(event, backspace) {
        this.formatTextAndEmitValue(event, false);
    }

    private formatTextAndEmitValue(event, appendZeros: boolean = false) {
        if (this.allowDecimals !== null && event !== undefined && event !== null) {
            let valWithoutCommas: string = "";
            let hasNegative: boolean = false;
            const valArray = event.toString().split(".");
            for (let i = 0; i < valArray.length; ++i) {
                // remove all non-numbers
                if ((valArray[i] as string).startsWith("-")) {
                    hasNegative = true;
                }
                valArray[i] = valArray[i].replace(this.nonNumRegx, "");
            }

            let displayValue: string;

            if (valArray.length === 0) {
                if (hasNegative && coerceBooleanProperty(this.allowNegative)) {
                    displayValue = "-";
                } else {
                    displayValue = "";
                }

                this.onValueChanged.emit(null);
            } else {

                valWithoutCommas = valArray[0];

                let threeNumbersMatches = valArray[0].match(this.threeNumberRegx);

                if (threeNumbersMatches !== null && valArray[0].length > 3) {
                    displayValue =  Number(valArray[0]).toLocaleString("en-GB"); 
                } else {
                    displayValue = valArray[0];
                }

                if (coerceBooleanProperty(this.allowDecimals)) {
                    let textValue = "";
                    if (valArray.length > 1) {
                        textValue = valArray[1];
                    }

                    let decimals = textValue.substring(0, 2);
                    let decimalDisplay = decimals;
                    if (this.model.disabled || appendZeros) {
                        decimalDisplay = this.addZerosForDecimals(textValue);
                    }

                    if (valArray.length > 1 || this.model.disabled || appendZeros) {
                        displayValue += "." + decimalDisplay;
                        valWithoutCommas += "." + decimalDisplay;
                    }
                }

                if (hasNegative && coerceBooleanProperty(this.allowNegative)) {
                    displayValue = "-" + displayValue;
                    valWithoutCommas = "-" + valWithoutCommas;
                }

                let emitVal: number = Number.parseFloat(valWithoutCommas);

                if (!emitVal && emitVal !== 0) {
                    emitVal = null;
                }

                this.onValueChanged.emit(emitVal);
            }
            // set the new value
            this.model.valueAccessor.writeValue(displayValue);
        }
    }

    @HostListener("blur", ["$event"])
    public onBlur(event) {
        if (coerceBooleanProperty(this.allowDecimals)) {
            this.formatTextAndEmitValue(this.model.value, true);
        }
    }

    private addZerosForDecimals(decimalDisplay: string): string {
        decimalDisplay = decimalDisplay.substring(0, 2);
        while (decimalDisplay.length < 2) {
            decimalDisplay += "0";
        }
        return decimalDisplay;
    }

    private getCommaGroupNumbers(valArray) : string {
        return Array.from(Array.from(valArray[0]).reverse().join("").match(this.threeNumberRegx).join()).reverse().join("");
    }
}