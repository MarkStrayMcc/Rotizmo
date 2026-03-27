import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { DateFieldComponent } from "./date-field.component";
import { MockErrorComponent, MockDatePickerComponent } from "@app/mocks/components.mocks";

describe("DateFieldComponent", () => {
    let component: DateFieldComponent;
    let fixture: ComponentFixture<DateFieldComponent>;

    const testModuleConfiguration = {
        declarations: [
            DateFieldComponent,
            MockErrorComponent,
            MockDatePickerComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(DateFieldComponent);
        component = fixture.componentInstance;
    });

    it("should create DateField component", () => {
        expect(component).toBeDefined();
    });
});
