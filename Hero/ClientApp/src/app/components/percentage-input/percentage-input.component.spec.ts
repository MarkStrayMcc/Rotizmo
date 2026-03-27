import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PercentageInputComponent } from "./percentage-input.component";
import { ReactiveFormsModule } from "@angular/forms";
import { SimpleChange } from "@angular/core";
import { NumberOnly } from "../../directives/number-only.directive";
import { ErrorModule } from "@app/shared/error.module";

describe("PercentageInputComponent", () => {
    let component: PercentageInputComponent;
    let fixture: ComponentFixture<PercentageInputComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PercentageInputComponent, NumberOnly],
            imports: [ReactiveFormsModule, ErrorModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PercentageInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("Should create component", () => {
        expect(component).toBeTruthy();
        expect(component.percentageForm).toBeDefined();
    });

    it("Should emit percentageFormCreated event on initialisation", () => {
        // Actors
        spyOn(component.percentageFormCreated, "emit");

        // Actions
        component.ngOnInit();

        // Asserts
        expect(component.percentageFormCreated.emit).toHaveBeenCalledTimes(1);
        expect(component.percentageFormCreated.emit).toHaveBeenCalledWith(component.percentageForm);
    });

    it("Should emit valueChange event on initialisation", () => {
        // Actors
        spyOn(component.valueChange, "emit");

        // Actions
        component.defaultValue = 50;
        component.ngOnInit();

        // Asserts
        expect(component.valueChange.emit).toHaveBeenCalledTimes(2);
        expect(component.valueChange.emit).toHaveBeenCalledWith(50);
    });

    it("Should set validators on initialisation", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        spyOn(component.percentageForm.valueChanges, "subscribe");
        percentageControl.clearValidators();
        var validatorsInitial = percentageControl.validator;

        // Actions
        component.ngOnInit();
        var validatorsFinal = percentageControl.validator;

        // Asserts
        expect(validatorsInitial).toBeNull();
        expect(validatorsFinal).toBeDefined();
        expect(component.percentageForm.valueChanges.subscribe).toHaveBeenCalledTimes(1);
    });

    it("Should not require percentage to have a value by default", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        var hasRequiredErrorInitial = percentageControl.hasError("required");
        var isPercentageControlValidInitial = percentageControl.valid;
        var isPercentageFormValidInitial = component.percentageForm.valid;

        // Actions
        percentageControl.setValue(null);
        percentageControl.markAsDirty();
        fixture.detectChanges();

        // Asserts
        expect(hasRequiredErrorInitial).toBeFalsy();
        expect(isPercentageControlValidInitial).toBeTruthy();
        expect(isPercentageFormValidInitial).toBeTruthy();

        expect(percentageControl.hasError("required")).toBeFalsy();
        expect(percentageControl.valid).toBeTruthy();
        expect(component.percentageForm.valid).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelectorAll("li").length).toBe(0);
    });

    it("Should require percentage to be greater than or equal to 0 by default", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        const hasMinErrorInitial = percentageControl.hasError("min");
        const isPercentageControlValidInitial = percentageControl.valid;
        const isPercentageFormValidInitial = component.percentageForm.valid;

        // Actions
        percentageControl.setValue(-1);
        percentageControl.markAsDirty();
        component.ngOnChanges({ minValue: new SimpleChange(0, -1, false) });
        fixture.detectChanges();

        // Asserts
        expect(hasMinErrorInitial).toBeFalsy();
        expect(isPercentageControlValidInitial).toBeTruthy();
        expect(isPercentageFormValidInitial).toBeTruthy();

        expect(percentageControl.hasError("min")).toBeTruthy();
        expect(percentageControl.valid).toBeFalsy();
        expect(component.percentageForm.valid).toBeFalsy();
        expect(fixture.debugElement.nativeElement.querySelectorAll("li").length).toBe(1);
    });

    it("Should require percentage to be less than or equal to 100 by default", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        const hasMaxErrorInitial = percentageControl.hasError("max");
        const isPercentageControlValidInitial = percentageControl.valid;
        const isPercentageFormValidInitial = component.percentageForm.valid;

        // Actions
        percentageControl.setValue(101);
        percentageControl.markAsDirty();
        component.ngOnChanges({ minValue: new SimpleChange(0, 101, false) });
        fixture.detectChanges();

        // Asserts
        expect(hasMaxErrorInitial).toBeFalsy();
        expect(isPercentageControlValidInitial).toBeTruthy();
        expect(isPercentageFormValidInitial).toBeTruthy();

        expect(percentageControl.hasError("max")).toBeTruthy();
        expect(percentageControl.valid).toBeFalsy();
        expect(component.percentageForm.valid).toBeFalsy();
        expect(fixture.debugElement.nativeElement.querySelectorAll("li").length).toBe(1);
    });

    it("Should remove duplicate special characters", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        component.minValue = -10;
        component.ngOnChanges({ minValue: new SimpleChange(0, -10, false) });
        spyOn(component.valueChange, "emit");

        // Actions
        percentageControl.setValue("--1.-.2.3");

        // Asserts
        expect(percentageControl.value).toBe("-1.23");
        expect(component.valueChange.emit).toHaveBeenCalledTimes(1);
        expect(component.valueChange.emit).toHaveBeenCalledWith(-1.23);
    });

    it("Should only keep the minus sign if it is at the start of the input value", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        component.minValue = -10;
        component.ngOnChanges({ minValue: new SimpleChange(0, -10, false) });
        spyOn(component.valueChange, "emit");

        // Actions
        percentageControl.setValue("-1.-23-");
        const result1 = percentageControl.value;
        percentageControl.setValue("1.-23-");

        // Asserts
        expect(result1).toBe("-1.23");
        expect(percentageControl.value).toBe("1.23");
        expect(component.valueChange.emit).toHaveBeenCalledTimes(2);
        expect(component.valueChange.emit).toHaveBeenCalledWith(-1.23);
        expect(component.valueChange.emit).toHaveBeenCalledWith(1.23);
    });

    it("Should truncate percentage to 2 decimal places by default", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        component.minValue = -10;
        component.ngOnChanges({ minValue: new SimpleChange(0, -10, false) });
        spyOn(component.valueChange, "emit");

        // Actions
        percentageControl.setValue("1.23456");
        const result1 = percentageControl.value;
        percentageControl.setValue(".23456");
        const result2 = percentageControl.value;
        percentageControl.setValue("-.23456");

        // Asserts
        expect(result1).toBe("1.23");
        expect(result2).toBe(".23");
        expect(percentageControl.value).toBe("-.23");
        expect(component.valueChange.emit).toHaveBeenCalledTimes(3);
        expect(component.valueChange.emit).toHaveBeenCalledWith(1.23);
        expect(component.valueChange.emit).toHaveBeenCalledWith(0.23);
        expect(component.valueChange.emit).toHaveBeenCalledWith(-0.23);
    });

    it("Should update the percentage value on default value input change", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        percentageControl.setValue(100);
        spyOn(component.valueChange, "emit");

        // Actions
        component.defaultValue = 50;
        component.ngOnChanges({ defaultValue: new SimpleChange(100, 50, false) });

        // Asserts
        expect(percentageControl.value).toBe("50");
        expect(component.valueChange.emit).toHaveBeenCalledTimes(1);
        expect(component.valueChange.emit).toHaveBeenCalledWith(50);
    });

    it("Should not update the percentage value on default value input change to the same value as the control", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        percentageControl.setValue(50);
        spyOn(component.valueChange, "emit");

        // Actions
        component.defaultValue = 50;
        component.ngOnChanges({ defaultValue: new SimpleChange(100, 50, false) });

        // Asserts
        expect(percentageControl.value).toBe("50");
        expect(component.valueChange.emit).toHaveBeenCalledTimes(0);
    });

    it("Should require percentage to have a value when the isRequired input is changed to true", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        percentageControl.setValue(null);
        const hasRequiredErrorInitial = percentageControl.hasError("required");
        const isPercentageControlValidInitial = percentageControl.valid;
        const isPercentageFormValidInitial = component.percentageForm.valid;

        // Actions
        component.isRequired = true;
        component.ngOnChanges({ isRequired: new SimpleChange(false, true, false) });
        percentageControl.updateValueAndValidity();
        percentageControl.markAsTouched();
        fixture.detectChanges();

        // Asserts
        expect(hasRequiredErrorInitial).toBeFalsy();
        expect(isPercentageControlValidInitial).toBeTruthy();
        expect(isPercentageFormValidInitial).toBeTruthy();

        expect(percentageControl.hasError("required")).toBeTruthy();
        expect(percentageControl.valid).toBeFalsy();
        expect(component.percentageForm.valid).toBeFalsy();
        //expect(fixture.debugElement.nativeElement.querySelectorAll("li").length).toBe(1);
    });

    it("Should update minimum required percentage value on input change", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        percentageControl.setValue(-1);
        var hasMinErrorInitial = percentageControl.hasError("min");
        var isPercentageControlValidInitial = percentageControl.valid;
        var isPercentageFormValidInitial = component.percentageForm.valid;

        // Actions
        component.minValue = -10;
        component.ngOnChanges({ minValue: new SimpleChange(0, -10, false) });
        percentageControl.updateValueAndValidity();
        percentageControl.markAsTouched();
        fixture.detectChanges();

        // Asserts
        expect(hasMinErrorInitial).toBeTruthy();
        expect(isPercentageControlValidInitial).toBeFalsy();
        expect(isPercentageFormValidInitial).toBeFalsy();

        expect(percentageControl.hasError("min")).toBeFalsy();
        expect(percentageControl.valid).toBeTruthy();
        expect(component.percentageForm.valid).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelectorAll("li").length).toBe(0);
    });

    it("Should remove minimum required percentage validation on input change to null", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        percentageControl.setValue(-1);
        var hasMinErrorInitial = percentageControl.hasError("min");
        var isPercentageControlValidInitial = percentageControl.valid;
        var isPercentageFormValidInitial = component.percentageForm.valid;

        // Actions
        component.minValue = null;
        component.ngOnChanges({ minValue: new SimpleChange(0, null, false) });
        percentageControl.updateValueAndValidity();
        percentageControl.markAsTouched();
        fixture.detectChanges();

        // Asserts
        expect(hasMinErrorInitial).toBeTruthy();
        expect(isPercentageControlValidInitial).toBeFalsy();
        expect(isPercentageFormValidInitial).toBeFalsy();

        expect(percentageControl.hasError("min")).toBeFalsy();
        expect(percentageControl.valid).toBeTruthy();
        expect(component.percentageForm.valid).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelectorAll("li").length).toBe(0);
    });

    it("Should update maximum required percentage value on input change", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        percentageControl.setValue(101);
        var hasMaxErrorInitial = percentageControl.hasError("max");
        var isPercentageControlValidInitial = percentageControl.valid;
        var isPercentageFormValidInitial = component.percentageForm.valid;

        // Actions
        component.maxValue = 110;
        component.ngOnChanges({ minValue: new SimpleChange(100, 110, false) });
        percentageControl.updateValueAndValidity();
        percentageControl.markAsTouched();
        fixture.detectChanges();

        // Asserts
        expect(hasMaxErrorInitial).toBeTruthy();
        expect(isPercentageControlValidInitial).toBeFalsy();
        expect(isPercentageFormValidInitial).toBeFalsy();

        expect(percentageControl.hasError("max")).toBeFalsy();
        expect(percentageControl.valid).toBeTruthy();
        expect(component.percentageForm.valid).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelectorAll("li").length).toBe(0);
    });

    it("Should update number of allowed decimal places for percentage value on input change", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        spyOn(component.valueChange, "emit");

        // Actions
        percentageControl.setValue("1.23456");
        component.decimalPlaces = 4;
        component.ngOnChanges({ decimalPlaces: new SimpleChange(2, 4, false) });
        percentageControl.setValue("1.234567");

        // Asserts
        expect(percentageControl.value).toBe("1.2345");
        expect(component.valueChange.emit).toHaveBeenCalledTimes(2);
        expect(component.valueChange.emit).toHaveBeenCalledWith(1.23);
        expect(component.valueChange.emit).toHaveBeenCalledWith(1.2345);
    });

    it("Should emit valueChange event on value change", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        component.minValue = -10;
        component.ngOnChanges({ minValue: new SimpleChange(0, -10, false) });
        spyOn(component.valueChange, "emit");
        
        // Actions
        percentageControl.setValue(50);
        percentageControl.setValue("-");
        percentageControl.setValue("-11");
        percentageControl.setValue("-.45");
        percentageControl.setValue("12A");
        percentageControl.setValue("");
        percentageControl.setValue(0);
        percentageControl.setValue(null);

        // Asserts
        expect(component.valueChange.emit).toHaveBeenCalledTimes(7);
        expect(component.valueChange.emit).toHaveBeenCalledWith(50);
        expect(component.valueChange.emit).toHaveBeenCalledWith(0);
        expect(component.valueChange.emit).toHaveBeenCalledWith(-0.45);
        expect(component.valueChange.emit).toHaveBeenCalledWith(null);
        expect(component.valueChange.emit).toHaveBeenCalledWith(0);
        expect(component.valueChange.emit).toHaveBeenCalledWith(null);
    });

    it("Should emit valueChange event for empty string regardless of the control validity", () => {
        // Actors
        const percentageControl = component.percentageForm.get("percentage");
        component.isRequired = true;
        component.ngOnChanges({ isRequired: new SimpleChange(false, true, false) });
        percentageControl.updateValueAndValidity();
        spyOn(component.valueChange, "emit");

        // Actions
        percentageControl.setValue("-1");
        percentageControl.markAsDirty();
        fixture.detectChanges();
        percentageControl.setValue("");
        component.ngOnChanges({ });
        fixture.detectChanges();

        // Asserts
        expect(percentageControl.hasError("required")).toBeTruthy();
        expect(percentageControl.valid).toBeFalsy();
        expect(component.percentageForm.valid).toBeFalsy();
        expect(fixture.debugElement.nativeElement.querySelectorAll("li").length).toBe(1);
        expect(component.valueChange.emit).toHaveBeenCalledTimes(2);
        expect(component.valueChange.emit).toHaveBeenCalledWith(null);
    });
});
