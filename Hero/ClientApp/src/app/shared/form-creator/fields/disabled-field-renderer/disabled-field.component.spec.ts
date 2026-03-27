import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { DisabledFieldRendererComponent } from "./disabled-field-renderer.component";

describe("DisabledFieldRendererComponent", () => {
    let component: DisabledFieldRendererComponent;
    let fixture: ComponentFixture<DisabledFieldRendererComponent>;

    const testModuleConfiguration = {
        declarations: [
            DisabledFieldRendererComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(DisabledFieldRendererComponent);
        component = fixture.componentInstance;
    });

    it("should create CheckboxField component", () => {
        expect(component).toBeDefined();
    });
});
