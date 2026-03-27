import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { CheckboxFieldComponent } from "./checkbox-field.component";

describe("CheckboxFieldComponent", () => {
    let component: CheckboxFieldComponent;
    let fixture: ComponentFixture<CheckboxFieldComponent>;

    const testModuleConfiguration = {
        declarations: [
            CheckboxFieldComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(CheckboxFieldComponent);
        component = fixture.componentInstance;
    });

    it("should create Checkbox component", () => {
        expect(component).toBeDefined();
    });
});
