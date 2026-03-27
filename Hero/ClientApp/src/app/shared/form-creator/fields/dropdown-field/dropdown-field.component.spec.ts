import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MockErrorComponent } from "@app/mocks/components.mocks";
import { DropDownFieldService } from "@app/shared/services/dropdown-field.service";
import { DropDownFieldComponent } from "./dropdown-field.component";

describe("DropDownFieldComponent", () => {
    let component: DropDownFieldComponent;
    let fixture: ComponentFixture<DropDownFieldComponent>;

    const testModuleConfiguration = {
        declarations: [
            MockErrorComponent,
            DropDownFieldComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: [
            { provide: DropDownFieldService, useValue: {} }
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(DropDownFieldComponent);
        component = fixture.componentInstance;
    });

    it("should create component", () => {
        expect(component).toBeDefined();
    });
});
