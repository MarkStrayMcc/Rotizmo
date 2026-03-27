import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ReadOnlyFieldComponent } from "./readonly-field.component";

describe("ReadOnlyFieldComponent", () => {
    let component: ReadOnlyFieldComponent;
    let fixture: ComponentFixture<ReadOnlyFieldComponent>;

    const testModuleConfiguration = {
        declarations: [
            ReadOnlyFieldComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(ReadOnlyFieldComponent);
        component = fixture.componentInstance;
    });

    it("should create ReadOnlyField component", () => {
        expect(component).toBeDefined();
    });
});
