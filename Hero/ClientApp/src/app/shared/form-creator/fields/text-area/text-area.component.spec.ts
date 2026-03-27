import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MockErrorComponent } from "@app/mocks/components.mocks";
import { FormCreatorService } from "@app/shared/services/form-creator.service";
import { mockFormCreatorService } from "../../form-creator.component.mock";
import { TextAreaFieldComponent } from "./text-area.component";

describe("TextAreaFieldComponent", () => {
    let component: TextAreaFieldComponent;
    let fixture: ComponentFixture<TextAreaFieldComponent>;

    const testModuleConfiguration = {
        declarations: [
            TextAreaFieldComponent,
            MockErrorComponent
        ],
        imports: [
            CommonModule,
            ReactiveFormsModule
        ],
        providers: [
            { provide: FormCreatorService, useValue: mockFormCreatorService },
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(TextAreaFieldComponent);
        component = fixture.componentInstance;
    });

    it("should create TextAreaField component", () => {
        expect(component).toBeDefined();
    });
});
