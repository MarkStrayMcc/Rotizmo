import { AfterViewInit, Component, EventEmitter, forwardRef, Input, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Currency } from "@app/models";
import { NouiFormatter, NouisliderComponent } from "ng2-nouislider";

@Component({
    selector: "currency-slider",
    templateUrl: "./currency-slider.component.html",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CurrencySliderComponent),
            multi: true
        }
    ],
    styleUrls: ["./currency-slider.component.scss"]
})
/** slider component*/
export class CurrencySliderComponent implements ControlValueAccessor, AfterViewInit {
    @Input() public currency: Currency = {
        symbol: "£",
        id: 1,
        isoCode: "GBP",
        name: "Pound",
        rate: 1.0
    };
    @Input() public minimum: number = 0;
    @Input() public maximum: number = 2000000;
    @Input() public defaultMin: number;
    @Input() public defaultMax: number;
    @Input() public mandatoryStep: number;
    /**
     *      The steps we should show for this control, excluding min and max*/
    @Input() public steps: number[] = [];

    @Output() public controlCreated = new EventEmitter<FormControl>();
    @ViewChild("slider") private slider: NouisliderComponent;

    public hasControlBeenCreated: boolean = false;
    public snap: boolean = true;
    public tooltips: boolean = true;

    public sliderConfig: any;
    public form: FormGroup;
    public rangeCtrl: FormControl;

    private onChangeEvent: (range: any) => void;
    private onTouchEvent: () => void;

    public get rangeControl(): FormControl {
        if (!this.rangeCtrl) {
            this.rangeCtrl = new FormControl([this.minimum, this.maximum]);
            this.rangeCtrl.enable();
        }

        return this.rangeCtrl;
    }

    public ngAfterViewInit(): void {
        if (this.slider && !this.hasControlBeenCreated) {
            this.slider.config = this.getSliderConfig();
            this.slider.writeValue([this.defaultMin, this.defaultMax]);
            this.rangeControl.valueChanges.subscribe(minMaxValues => {
                if (this.onChangeEvent) {
                    this.onChangeEvent(minMaxValues);
                }
            });

            this.hasControlBeenCreated = true;
            this.controlCreated.emit(this.rangeCtrl);

            this.preventMinMaxFromPassingQuotedStep();
        }
    }

    public preventMinMaxFromPassingQuotedStep() {
        this.slider.slider.on('change', (values, handle) => {
            const currentValue = this.unAbbreviateNumber(values[handle]);
            if (handle === 0 && currentValue > this.mandatoryStep) {
                this.slider.slider.setHandle(handle, this.mandatoryStep);
                return;
            }
            if (handle === 1 && currentValue < this.mandatoryStep) {
                this.slider.slider.setHandle(handle, this.mandatoryStep);
                return;
            }
        });
    }

    public onSliderStartEvent() {
        if (this.onTouchEvent) {
            this.onTouchEvent();
        }
    }

    public writeValue(rangeVals: Array<number>): void {
        if (rangeVals && Array.isArray(rangeVals) && rangeVals.length === 2
            && this.hasControlBeenCreated) {
            this.slider.writeValue(rangeVals);
        }
    }

    public registerOnChange(onChangeFunction: any): void {
        this.onChangeEvent = onChangeFunction;
    }

    public registerOnTouched(onTouchedFunction: any): void {
        this.onTouchEvent = onTouchedFunction;
    }

    public setDisabledState?(isDisabled: boolean): void {
        if (this.rangeCtrl) {
            if (isDisabled) {
                this.rangeCtrl.disable();
            } else {
                this.rangeCtrl.enable();
            }
        }
    }

    public getAbbreviatedNumber(value: number): string {
        if (value < 1000000)
            return `${this.currency.symbol}${value / 1000}K`;
        else
            return `${this.currency.symbol}${value / 1000000}M`;
    }

    public unAbbreviateNumber(value: string): number {
        let multiplier = 1;
        if (value.toUpperCase().endsWith("K")) {
            multiplier = 1000;
        }
        if (value.toUpperCase().endsWith("M")) {
            multiplier = 1000000;
        }

        let trimmedValue = value;
        if (value.startsWith(this.currency.symbol)) {
            trimmedValue = value.slice(1, value.length - 1);
        }

        return Number(trimmedValue) * multiplier;
    }

    public currencyFormatter(): NouiFormatter {
        return {
            from: (x) => {
                return this.unAbbreviateNumber(x);
            },
            to: (x) => {
                return this.getAbbreviatedNumber(x);
            }
        };
    }

    public getStepConfig(): any {
        if (this.minimum === undefined || this.minimum === null) {
            this.minimum = 0;
        }
        if (this.maximum === undefined || this.maximum === null) {
            this.maximum = 1;
        }
        let initialConfig = {
            min: this.minimum,
            max: this.maximum
        };

        if (this.steps) {
            let numberToDivideBy = this.maximum - this.minimum;
            for (let i of this.steps) {
                if (i < this.minimum ||
                    i > this.maximum) {
                    continue;
                }
                let percent = ((i - this.minimum) / numberToDivideBy) * 100;
                percent = Math.floor(percent * 100) / 100;
                initialConfig[`${percent}%`] = i;
            }
        }

        return initialConfig;
    }

    public getSliderConfig(): any {
        if (this.minimum === undefined || this.minimum === null ||
            this.maximum === undefined || this.maximum === null) {
            return undefined;
        }
        if (this.defaultMin === undefined || this.defaultMin === null) {
            this.defaultMin = this.minimum;
        }
        if (this.defaultMax === undefined || this.defaultMax === null) {
            this.defaultMax = this.maximum;
        }
        // set up config here
        return {
            start: [this.defaultMin, this.defaultMax],
            connect: true,
            snap: this.snap,
            tooltips: this.tooltips,
            format: this.currencyFormatter(),
            range: this.getStepConfig()
        };
    }
}
