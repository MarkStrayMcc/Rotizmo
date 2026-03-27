/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { CurrencySliderComponent } from '@app/components/slider/currency-slider.component';
import { Currency } from '@app/models';

let component: CurrencySliderComponent;
let fixture: ComponentFixture<CurrencySliderComponent>;

describe('slider component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ CurrencySliderComponent ],
            imports: [BrowserModule, ReactiveFormsModule, NouisliderModule],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        }).compileComponents();
        
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CurrencySliderComponent);
        component = fixture.componentInstance;
    });

    it('Should return control', async(() => {
        // Actors
        const expectedMaxStartValue = 2000000;

        // Actions
        const control = component.rangeCtrl;

        // Asserts
        expect(control).toBeDefined();
        expect(control.disabled).toBeDefined();
        expect(control.disabled).toBeFalsy();

    }));

    it("Should emit controlCreated event after view initialised", async(() => {
        // Actors
        spyOn(component.controlCreated, "emit");
        component.hasControlBeenCreated = false;

        // Actions
        component.ngAfterViewInit();

        // Asserts
        expect(component.hasControlBeenCreated).toBeTruthy();
        expect(component.controlCreated.emit).toHaveBeenCalledTimes(1);
        expect(component.controlCreated.emit).toHaveBeenCalledWith(component.rangeCtrl);
    }));


    it("Should disable control", async(() => {
        // Actors
        const isControlDisabledInitial = component.rangeCtrl.disabled;

        // Actions
        component.setDisabledState(true);
        const isControlDisabledFinal = component.rangeCtrl.disabled;

        // Asserts
        expect(isControlDisabledInitial).toBeFalsy();
        expect(isControlDisabledFinal).toBeTruthy();
    }));

    it("Should enable control", async(() => {

        // Actions
        component.setDisabledState(false);
        const isControlDisabledFinal = component.rangeCtrl.disabled;

        // Asserts
        expect(isControlDisabledFinal).toBeFalsy();
    }));

    describe("value conversion", () => {
        it("should show #K for values in the thousands", () => {
            // assemble
            component.currency = {
                symbol: "£"
            } as Currency;

            // act
            let result = component.getAbbreviatedNumber(2000) as string;

            // assert
            expect(result).toBe("£2K");
        });

        it("should show ##K for values in the ten thousands", () => {
            // assemble
            component.currency = {
                symbol: "£"
            } as Currency;

            // act
            let result = component.getAbbreviatedNumber(20000) as string;

            // assert
            expect(result).toBe("£20K");
        });

        it("should show ###K for values in the hundred thousands", () => {
            // assemble
            component.currency = {
                symbol: "£"
            } as Currency;

            // act
            let result = component.getAbbreviatedNumber(200000) as string;

            // assert
            expect(result).toBe("£200K");
        });

        it("should show #M for values in the millions", () => {
            // assemble
            component.currency = {
                symbol: "£"
            } as Currency;

            // act
            let result = component.getAbbreviatedNumber(2000000) as string;

            // assert
            expect(result).toBe("£2M");
        });

        it("should un-abbreviate numbers from £#K format", () => {
            // assemble
            // act
            let value = component.unAbbreviateNumber("£5K");

            // assert
            expect(value).toBe(5000);
        });

        it("should un-abbreviate numbers from £#M format", () => {
            // assemble
            // act
            let value = component.unAbbreviateNumber("£5M");

            // assert
            expect(value).toBe(5000000);
        });

        it("should un-abbreviate numbers that are plain numbers", () => {
            // assemble
            // act
            let value = component.unAbbreviateNumber("5");

            // assert
            expect(value).toBe(5);
        });
    });
    describe("step conversion", () => {
        it("should return the min and max of zero and 1 if neither are defined at the time", () => {
            //  assemble
            component.steps = null;
            component.minimum = undefined;
            component.maximum = undefined;

            // act
            let stepConfig = component.getStepConfig();

            // assert
            expect(stepConfig.min).toBe(0);
            expect(stepConfig.max).toBe(1);
        });

        it("should return the min and max if nothing else is set up", () => {
            //  assemble
            component.steps = [];

            // act
            let stepConfig = component.getStepConfig();

            // assert
            expect(stepConfig.min).toBe(component.minimum);
            expect(stepConfig.max).toBe(component.maximum);
        });

        it("should return the min and max if steps are null", () => {
            //  assemble
            component.steps = null;

            // act
            let stepConfig = component.getStepConfig();

            // assert
            expect(stepConfig.min).toBe(component.minimum);
            expect(stepConfig.max).toBe(component.maximum);
        });

        it("should return 50% for 1000 if max is 2000 and min is 0", () => {
            //  assemble
            component.maximum = 2000;
            component.minimum = 0;
            component.steps = [1000];

            // act
            let stepConfig = component.getStepConfig();

            // assert
            expect(stepConfig.min).toBe(component.minimum);
            expect(stepConfig["50%"]).toBe(1000);
            expect(stepConfig.max).toBe(component.maximum);
        });

        it("should return 33.33% for 1000 if max is 2000 and min is 500", () => {
            //  assemble
            component.maximum = 2000;
            component.minimum = 500;
            component.steps = [1000];

            // act
            let stepConfig = component.getStepConfig();

            // assert
            expect(stepConfig.min).toBe(component.minimum);
            expect(stepConfig["33.33%"]).toBe(1000);
            expect(stepConfig.max).toBe(component.maximum);
        });

        it("should not return a step if it is less than the minimum", () => {
            //  assemble
            component.maximum = 2000;
            component.minimum = 500;
            component.steps = [200];

            // act
            let stepConfig = component.getStepConfig();
            let keys = Object.keys(stepConfig);

            // assert
            expect(keys.length).toBe(2);
        });

        it("should not return a step if it is more than the maximum", () => {
            //  assemble
            component.maximum = 2000;
            component.minimum = 500;
            component.steps = [2300];

            // act
            let stepConfig = component.getStepConfig();
            let keys = Object.keys(stepConfig);

            // assert
            expect(keys.length).toBe(2);
        });

        it("should return steps for each step when multiple given", () => {
            //  assemble
            component.maximum = 3000;
            component.minimum = 0;
            component.steps = [300, 600, 1500];

            // act
            let stepConfig = component.getStepConfig();
            let keys = Object.keys(stepConfig);

            // assert
            expect(keys.length).toBe(5);
            expect(stepConfig["10%"]).toBe(300);
            expect(stepConfig["20%"]).toBe(600);
            expect(stepConfig["50%"]).toBe(1500);
        });

        it("should return steps for sub-percent steps", () => {
            //  assemble
            component.maximum = 3000;
            component.minimum = 0;
            component.steps = [3, 300, 600, 1500];

            // act
            let stepConfig = component.getStepConfig();
            let keys = Object.keys(stepConfig);

            // assert
            expect(keys.length).toBe(6);
            expect(stepConfig["0.1%"]).toBe(3);
            expect(stepConfig["10%"]).toBe(300);
            expect(stepConfig["20%"]).toBe(600);
            expect(stepConfig["50%"]).toBe(1500);
        });
    });
    describe("slider config setup", () => {
        it("should set the start for the slider config", () => {
            // assemble
            // act
            let config = component.getSliderConfig();

            // assert
            expect(config.start).toBeDefined();
        });
        
        it("should set the start for the slider config based on the defaultMin and defaultMax", () => {
            // assemble
            component.defaultMin = 0;
            component.defaultMax = 500;

            // act
            let config = component.getSliderConfig();

            // assert
            expect(config.start[0]).toBe(component.defaultMin);
            expect(config.start[1]).toBe(component.defaultMax);
        });

        it("should return undefined if min not set", () => {
            // assemble
            component.minimum = null;
            component.maximum = 500;

            // act
            let config = component.getSliderConfig();

            // assert
            expect(config).toBeUndefined();
        });

        it("should return undefined if max not set", () => {
            // assemble
            component.minimum = 2;
            component.maximum = null;

            // act
            let config = component.getSliderConfig();

            // assert
            expect(config).toBeUndefined();
        });

        it("should set defaultMin to be min if not set", () => {
            // assemble
            component.minimum = 2;
            component.defaultMin = null;

            // act
            let config = component.getSliderConfig();

            // assert
            expect(config.start[0]).toBe(component.minimum);
        });

        it("should set defaultMax to be max if not set", () => {
            // assemble
            component.maximum = 2;
            component.defaultMax = null;

            // act
            let config = component.getSliderConfig();

            // assert
            expect(config.start[1]).toBe(component.maximum);
        });
    });
});
