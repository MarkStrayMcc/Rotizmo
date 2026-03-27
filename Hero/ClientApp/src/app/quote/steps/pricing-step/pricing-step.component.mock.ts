import { Quote } from "@angular/compiler";
import { Component, Directive, forwardRef, Injectable, Input, Output } from "@angular/core";
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CommissionRate, Currency, FeatureAccess, Message, PricingInformation, QuoteBindRequest } from "@app/models";
import { PricingResult } from '@app/quote/models/pricing/PricingResult';
import { EventEmitter } from "events";
import { from, Observable, of, Subject } from "rxjs";

let pricingInfo: PricingInformation = {
    businessLine: {
        name: 'CP',
        description: "Cyber & Privacy",
    },
    model: 308,
    suggested: 1200,
    minimumPremium: 300,
    quoted: 0,
    discount: -338.31,
    isExpanded: true,
    defaultFeePercentage: 10,
    fee: 80,
    binderSectionId: 828,
    isSelectedLine: true,
    ratingEngineVersionId: 1167,
    suggestedDiscount: 0,
    currentRateChangePremium: 2000,
    expiringRateChangePremium: 1200,
    expiringQuotedPremium: 89,
    filedPremium: 1000,
} as PricingInformation;


@Injectable()
export class MockPricingHttpService {
    public getCommissionRate(brokerTeamId: number, productId: number): Observable<CommissionRate> {
        const rate: CommissionRate = { rate: 25 };
        return from([rate]);
    }
}

export class MockFeaturesHttpService {
    public isFeatureActive(): Observable<FeatureAccess> {

        const featureAccessDto = {
            featureName: "HERO_MultiplePropertiesClauseForFrenchTerritories",
            hasAccess: true
        } as FeatureAccess;

        return of(featureAccessDto);
    }
}

@Injectable()
export class MockPremiumCalculationsService {
    public calculatePremium(quote: Quote) { return; }

    public getCalculatedQuotePremium(quote: Quote | QuoteBindRequest) { return 0; }

    public updatePremium() { return; }
    public calculateTotalFee(quote: Quote) { return; }
    public calculateFeeSplit(quote: Quote) { return; }
    public feeCalculationError = new Subject<string>();
}

@Injectable()
export class MockPricingService {
    public getPricingInformation(quote: Quote): Observable<PricingResult> {
        return of({ pricingInformations:[pricingInfo], locationOutputs: []});
    }

    public pricingInformationChanges(): Observable<boolean> {
        return of(true);
    }
}

export class mockUserService {
	isFeatureAccessible(): boolean {
		return true;
	};
};

@Injectable()
export class MockCoverageHttpService {
    public getAvailable = () => from([[]]);
}

@Injectable()
export class MockFeeHttpService {
    public getMaximumFee = () => of(null);
}

@Injectable()
export class MockMaximumFeeAsyncValidator {
    public validate = () => of(null);
}

@Injectable()
export class MockMessageService {
    public validate = () => of(null);
}

@Component({ selector: "business-line", template: "" })
export class MockBusinessCategoryPricingComponent {
    @Input() public form: FormGroup;
    @Input() public name = "";
    @Input() public isNewQuote: boolean;
    @Input() public currency: Currency;
    @Input() public quoteState = 1;
    @Output() public quoteChanged = new EventEmitter();
    @Output() public expandedChanged = new EventEmitter();
    @Input() public readonly: boolean;
    @Input() public quote: Quote;
}

@Component({
    selector: "percentage-input",
    template: "",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockPercentageInputComponent),
            multi: true
        }
    ]
})
export class MockPercentageInputComponent implements ControlValueAccessor {
    @Input() public defaultValue = 100;
    @Input() public isRequired = false;
    @Input() public isNewQuote = false;
    @Input() public allowNegative = false;
    @Input() public allowDecimal = false;
    @Input() public minValue = 0;
    @Input() public maxValue = 100;
    @Input() public decimalPlaces = 2;
    @Output() public valueChange = new EventEmitter();
    @Output() public percentageFormCreated = new EventEmitter();
    @Input() public readonly = false;

    public writeValue(obj) { return; }
    public registerOnChange(fn) { return; }
    public registerOnTouched(fn) { return; }
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
    @Input() public decimals = false;
    @Input() public readonly = false;
    @Input() public currency: Currency;
    @Input() public value: any;
    @Output() public valueChange = new EventEmitter();
    @Output() public focus = new EventEmitter();

    public writeValue(obj) { return; }
    public registerOnChange(fn) { return; }
    public registerOnTouched(fn) { return; }
}

@Directive({ selector: "[LargeNumber]" })
export class MockLargeNumberMask {
    @Input() public allowDecimals: boolean = null;
    @Input() public initialValue: number;
    @Output() public onValueChanged = new EventEmitter();
}

@Directive({ selector: "[number-only]" })
export class MockNumberOnly {
    @Input() public allowNegative = false;
    @Input() public allowDecimal = false;
}
