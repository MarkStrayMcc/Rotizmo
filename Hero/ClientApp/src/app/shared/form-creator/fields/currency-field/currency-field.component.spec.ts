import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MockCurrencyComponent } from "@app/mocks/components.mocks";
import { MockMatspinnerComponent } from "../../form-creator.component.mock";
import { CurrencyFieldComponent } from "./currency-field.component";

describe("CurrencyFieldComponent", () => {
    let component: CurrencyFieldComponent;
    let fixture: ComponentFixture<CurrencyFieldComponent>;

    const testModuleConfiguration = {
        declarations: [
            CurrencyFieldComponent,
            MockMatspinnerComponent,
            MockCurrencyComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(CurrencyFieldComponent);
        component = fixture.componentInstance;
    });

    it("should create CurrencyField component", () => {
        expect(component).toBeDefined();
    });
});
