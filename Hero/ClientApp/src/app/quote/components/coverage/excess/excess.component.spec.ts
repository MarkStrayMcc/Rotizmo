import { CommonModule } from "@angular/common";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { BrowserModule } from "@angular/platform-browser";
import { LeadExcessConfiguration } from "@app/models/extendedModels/LeadExcessConfiguration";
import { ErrorModule } from "@app/shared/error.module";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";
import { CoverageCalculationService } from "@app/services/coverage-calculation.service";
import {
  CoverageExcess,
  CoverageExcessType,
  Currency
} from "@app/models";
import { ExcessComponent } from "@app/quote/components/coverage/excess/excess.component";

describe("excess component", () => {
    let component: ExcessComponent;
    let fixture: ComponentFixture<ExcessComponent>;
    const currency: Currency = {
        id: 1,
        symbol: "£",
        isoCode: "gbr",
        name: "pound",
        rate: 1.0
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ExcessComponent,
                CurrencyComponent,
                LargeNumberMask
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                CommonModule,
                ErrorModule
            ],
            providers: [
                CoverageExcess,
                CoverageExcessType,
                FormBuilder,
                CoverageCalculationService
            ]
        });
        fixture = TestBed.createComponent(ExcessComponent);
        component = fixture.componentInstance;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExcessComponent);
        component = fixture.componentInstance;
        component.excess = getExcess();
        component.currency = currency;
    });

    it("Should create component", async(() => {
        expect(component).toBeTruthy();
    }));

    it("all values are compulsory when selected",
        async(() => {
            component.isSelected = true;
            fixture.detectChanges();
            expect(component.form.get("excessBasis").valid).toBe(false);
            expect(component.excessvalue.isValid()).toBe(false);
        }));

    it("no values are compulsory when not selected",
        async(() => {
            component.isSelected = false;
            fixture.detectChanges();
            expect(component.form.get("excessBasis").valid).toBe(true);
            expect(component.excessvalue.isValid()).toBe(true);
        }));

    it("no errors if all values complete",
        async(() => {
            fixture.detectChanges();

            component.form.get("excessBasis").setValue(1);
            component.excessvalue.control.setValue(1);

            fixture.detectChanges();

            expect(component.form.get("excessBasis").valid).toBe(true);
            expect(component.excessvalue.isValid()).toBe(true);
            expect(component.isValid()).toBe(true);
        }));

    it("Should accept Lead values when the defaults and current values are the same for leader and follower",
        async(() => {
            fixture.detectChanges();

            component.excess.excess = 1;
            component.excess.excessBasisId = 2;

            component.leadExcessConfiguration = getLeadExcessConfiguration(component.excess);

            component.leadExcessValue = 4;
            component.leadExcessBasis = 5;

            expect(component.excess.excess).toBe(4);
            expect(component.excess.excessBasisId).toBe(5);
        }));

    it("Should NOT accept Lead values when value is different from the leader",
        async(() => {
            fixture.detectChanges();

            const config = getLeadExcessConfiguration(component.excess);
            config.leaders[0].excess = 1;
            config.leaders[0].excessBasisId = 2;

            component.leadExcessConfiguration = config;

            component.excess.excess = 5;
            component.excess.excessBasisId = 5;

            component.leadExcessValue = 6;
            component.leadExcessBasis = 7;

            expect(component.excess.excess).toBe(5);
            expect(component.excess.excessBasisId).toBe(5);
        }));

    it("Should NOT accept Lead values when value is the same as the leader but the defaults are different",
        async(() => {
            fixture.detectChanges();

            component.excess.excess = 1;
            component.excess.excessBasisId = 2;

            const config = getLeadExcessConfiguration(component.excess);
            config.leaders[0].excess = 8;
            config.leaders[0].excessBasisId = 8;

            component.leadExcessConfiguration = config;

            component.leadExcessValue = 4;
            component.leadExcessBasis = 5;

            expect(component.excess.excess).toBe(1);
            expect(component.excess.excessBasisId).toBe(2);
        }));

    it("Should have a excess value of half the lead excess when the multiplication factor is 0.5",
        async(() => {
            fixture.detectChanges();

            component.excess.excess = 20;
            component.excess.excessType.defaultExcess = 20;

            const leadLimit = getExcess();
            leadLimit.excess = 40;
            leadLimit.excessType.defaultExcess = 40;

            const config = getLeadExcessConfiguration(leadLimit);
            config.multiplicationFactor = 0.5;
            config.leaders[0].excessType.defaultExcess = 40;

            component.leadExcessConfiguration = config;

            component.leadExcessValue = 100;

            expect(component.excess.excess).toBe(50);
        }));

    it("Should have a excess value of double the lead excess when the multiplication factor is 2",
        async(() => {
            fixture.detectChanges();

            component.excess.excess = 80;
            component.excess.excessType.defaultExcess = 80;

            const leadExcess = getExcess();
            leadExcess.excess = 40;
            leadExcess.excessType.defaultExcess = 40;

            const config = getLeadExcessConfiguration(leadExcess);
            config.multiplicationFactor = 2;
            config.leaders[0].excessType.defaultExcess = 40;

            component.leadExcessConfiguration = config;

            component.leadExcessValue = 100;

            expect(component.excess.excess).toBe(200);
        }));


    it("Should have a excess value of multiple leaders which is multiplied by the follow factor",
        async(() => {
            fixture.detectChanges();

            component.excess.excess = 80;
            component.excess.excessType.defaultExcess = 80;

            const leadExcess = getExcess();
            leadExcess.excess = 20;
            leadExcess.excessType.defaultExcess = 20;

            const leadExcessTwo = getExcess();
            leadExcessTwo.excess = 20;
            leadExcessTwo.excessType.defaultExcess = 20;

            const config = getMultipleLeadExcessConfiguration([leadExcess, leadExcessTwo]);
            config.multiplicationFactor = 2;
            config.leaders[0].excessType.defaultExcess = 20;
            config.leaders[1].excessType.defaultExcess = 20;

            component.leadExcessConfiguration = config;

            component.leadExcessValue = 100;

            expect(component.excess.excess).toBe(200);
        }));

    it("Should recalculate excess value of multiple leaders which is multiplied by the follow factor, when value is changed",
        async(() => {
            fixture.detectChanges();

            component.excess.excess = 80;
            component.excess.excessType.defaultExcess = 80;

            const leadExcess = getExcess();
            leadExcess.excess = 20;
            leadExcess.excessType.defaultExcess = 20;

            const leadExcessTwo = getExcess();
            leadExcessTwo.excess = 20;
            leadExcessTwo.excessType.defaultExcess = 20;

            const config = getMultipleLeadExcessConfiguration([leadExcess, leadExcessTwo]);
            config.multiplicationFactor = 2;
            config.leaders[0].excessType.defaultExcess = 20;
            config.leaders[1].excessType.defaultExcess = 20;

            component.leadExcessConfiguration = config;

            component.leadExcessValue = 100;
            component.leadExcessValue = 50;

            expect(component.excess.excess).toBe(100);
        }));


    it("When excessCoverageType 'isHidden' is true, none of the inputs should be visible.",
        async(() => {
            fixture.detectChanges();

            let excessEl = fixture.debugElement.query(By.css(".excess.row")).nativeElement;
            expect(excessEl).toBeDefined();
            expect(excessEl).not.toBeNull();
            expect(excessEl.hidden).toBe(false);

            component.excess.excessType.isHidden = true;
            fixture.detectChanges();

            excessEl = fixture.debugElement.query(By.css(".excess.row")).nativeElement;
            expect(excessEl).toBeDefined();
            expect(excessEl).not.toBeNull();
            expect(excessEl.hidden).toBe(true);
        }));

    it("Should still follow when default values are 0",
        async(() => {
            fixture.detectChanges();

            const config = getLeadExcessConfiguration(component.excess);
            config.leaders[0].excessType.defaultExcess = 0;
            component.excess.excessType.defaultExcess = 0;
            config.leaders[0].excess = 0;
            component.excess.excess = config.leaders[0].excess;

            component.leadExcessConfiguration = config;
            component.leadExcessValue = 6;

            expect(component.excess.excess).toBe(6);
        }));

    it("Should still follow when has a factor and reach 0",
        async(() => {
            fixture.detectChanges();

            const defaultLeadValue = 100000;
            const factor = 0.1;

            component.excess.excessType.defaultExcess = defaultLeadValue * factor;
            component.excess.excess = 10000;

            const config = getLeadExcessConfiguration(component.excess);

            config.multiplicationFactor = factor;
            config.leaders[0].excessType.defaultExcess = defaultLeadValue;
            config.leaders[0].excess = 100000;

            component.leadExcessConfiguration = config;

            component.leadExcessValue = defaultLeadValue;
            component.leadExcessValue = 0;
            component.leadExcessValue = 60;

            expect(component.excess.excess).toBe(6);
        }));

});

function getExcess(): CoverageExcess {
    const xs = new CoverageExcess();
    xs.coverageExcessTypeId = 1;
    xs.excess = null;
    xs.excessBasisId = null;
    xs.excessType = getExcessType();

    return xs;
}

function getExcessType(): CoverageExcessType {
    const xsType = new CoverageExcessType();
    xsType.coverageExcessTypeId = 1;
    xsType.defaultExcess = 1;
    xsType.defaultExcessBasis = 2;
    xsType.description = "Excess";
    xsType.availableExcessBasis = [];
    xsType.availableExcessBasis[1] = "Cost Inclusive";
    xsType.availableExcessBasis[2] = "Cost Exclusive";

    return xsType;
}

function getLeadExcessConfiguration(coverageExcess: CoverageExcess): LeadExcessConfiguration {
    const leadExcess = new CoverageExcess();
    leadExcess.excess = coverageExcess.excessType.defaultExcess;
    leadExcess.excessBasisId = coverageExcess.excessType.defaultExcessBasis;
    leadExcess.excessType = getExcessType();
    leadExcess.excessType.defaultExcess = leadExcess.excess;
    leadExcess.excessType.defaultExcessBasis = leadExcess.excessBasisId;
    const leadExcesses: CoverageExcess[] = [];
    leadExcesses.push(leadExcess);
    return new LeadExcessConfiguration(leadExcesses, 1);
}

function getMultipleLeadExcessConfiguration(coverageExcesses: CoverageExcess[]): LeadExcessConfiguration {
    const leadExcess = new CoverageExcess();
    leadExcess.excess = coverageExcesses[0].excessType.defaultExcess;
    leadExcess.excessBasisId = coverageExcesses[0].excessType.defaultExcessBasis;
    leadExcess.excessType = getExcessType();
    leadExcess.excessType.defaultExcess = leadExcess.excess;
    leadExcess.excessType.defaultExcessBasis = leadExcess.excessBasisId;
    const leadExcesses: CoverageExcess[] = [];
    leadExcesses.push(leadExcess);
    leadExcess.excess = coverageExcesses[1].excessType.defaultExcess;
    leadExcess.excessBasisId = coverageExcesses[1].excessType.defaultExcessBasis;
    leadExcess.excessType = getExcessType();
    leadExcess.excessType.defaultExcess = leadExcess.excess;
    leadExcess.excessType.defaultExcessBasis = leadExcess.excessBasisId;
    leadExcesses.push(leadExcess);
    return new LeadExcessConfiguration(leadExcesses, 1);

}
