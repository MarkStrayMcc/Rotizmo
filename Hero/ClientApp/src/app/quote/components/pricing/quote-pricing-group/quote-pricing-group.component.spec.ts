import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from "@angular/core/testing";
import { BrowserModule, By } from "@angular/platform-browser";
import { QuotePricingGroupComponent } from "./quote-pricing-group.component";
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { SharedModule } from "@app/shared/shared.module";
import { PricingGroup } from "@app/models";

let component: QuotePricingGroupComponent;
let fixture: ComponentFixture<QuotePricingGroupComponent>;
const formBuilder: FormBuilder = new FormBuilder();

describe("quote-pricing-group component", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ QuotePricingGroupComponent ],
            imports: [
                BrowserModule,
                ReactiveFormsModule,
                FormsModule,
                SharedModule
            ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                { provide: FormBuilder, useValue: formBuilder }
            ]
        }).compileComponents();;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuotePricingGroupComponent);
        component = fixture.componentInstance;
        component.pricingGroupInfo = new PricingGroup();
        component.pricingGroupInfo.isEditable = true;
        component.pricingGroupInfo.pricingGroupId = 1;
        component.pricingGroupInfo.title = "test";
        component.pricingGroupInfo.minExcess = 0;
        component.pricingGroupInfo.maxExcess = 10;
        component.pricingGroupInfo.minLimit = 0;
        component.pricingGroupInfo.maxLimit = 10;
        component.pricingGroupInfo.pricingGroupExcessSteps = [];
        component.pricingGroupInfo.pricingGroupLimitSteps = [];
        component.pricingGroupInfo.increasedLimitFactors = [];
        component.pricingGroupInfo.defaultMinLimit = 0;
        component.pricingGroupInfo.defaultMaxLimit = 10;
        component.pricingGroupInfo.defaultMinExcess = 0;
        component.pricingGroupInfo.defaultMaxExcess = 10;
        component.ngOnInit();
    });

    it("Should create component", async(() => {
        expect(component).toBeDefined();
    }));

    it("should set the readonly to true if we unselect the group", async(() => {

        // setup
        component.ngOnInit();
        fixture.detectChanges();

        const intialValue = component.form.get("isEditable").value;

        //Act
        component.form.get("isEditable").setValue(false);

        //Assert
        expect(component.readonly).toBeTruthy();

    }));

    it("should disable the controls if in readonly mode", async(() => {

        // setup
        component.ngOnInit();
        fixture.detectChanges();

        //Act
        component.form.controls.isEditable.setValue(false);

        //Assert
        expect(component.form.controls.minMaxLimit.enabled).toBeFalsy();
        expect(component.form.controls.minMaxExcess.enabled).toBeFalsy();
        expect(component.form.controls.increasedLimitFactor.enabled).toBeFalsy();

    }));
});
