import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { CarrierContributionsComponent } from "./carrier-contributions.component";
import { PercentageInputComponent } from "@app/components/percentage-input/percentage-input.component";
import { CurrencyComponent } from "@app/components/currency/currency.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NumberOnly } from "@app/directives/number-only.directive";
import { ErrorModule } from "@app/shared/error.module";
import { BrowserModule } from "@angular/platform-browser";
import { LargeNumberMask } from "@app/directives/large-number-mask.directive";

describe("CarrierContributionsComponent", () => {
    let component: CarrierContributionsComponent;
    let fixture: ComponentFixture<CarrierContributionsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                CarrierContributionsComponent,
                PercentageInputComponent,
                CurrencyComponent,
                NumberOnly,
                LargeNumberMask
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                ErrorModule
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarrierContributionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
