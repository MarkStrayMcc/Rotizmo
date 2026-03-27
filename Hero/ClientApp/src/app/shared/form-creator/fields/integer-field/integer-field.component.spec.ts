import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { IntegerFieldComponent } from "./integer-field.component";

describe("IntegerFieldComponent", () => {
    let component: IntegerFieldComponent;
    let fixture: ComponentFixture<IntegerFieldComponent>;

    const testModuleConfiguration = {
        declarations: [
            IntegerFieldComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(IntegerFieldComponent);
        component = fixture.componentInstance;
    });

    it("should create IntegerField component", () => {
        expect(component).toBeDefined();
    });
});
