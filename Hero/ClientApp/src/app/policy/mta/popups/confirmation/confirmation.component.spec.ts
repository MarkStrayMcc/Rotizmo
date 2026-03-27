import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {MtaConfirmationComponent} from "@app/policy/mta/popups/confirmation/confirmation.component";
import * as mtaMocks from "@app/policy/mocks/mta.mocks";
import {MatDialogRef} from "@angular/material/dialog";

describe("MtaConfirmationComponent", () => {
    let component: MtaConfirmationComponent;
    let fixture: ComponentFixture<MtaConfirmationComponent>;

    const testModuleConfiguration = {
        declarations: [
            MtaConfirmationComponent,
        ],
        imports: [
            CommonModule,
        ],
        providers: [
            { provide: MatDialogRef, useClass: mtaMocks.MockMatDialogRef },
        ]
    };

    beforeEach(() => {
        TestBed.configureTestingModule(testModuleConfiguration);

        fixture = TestBed.createComponent(MtaConfirmationComponent);
        component = fixture.componentInstance;

        component["saveButton"] = new mtaMocks.SaveButton();
    });

    it("should create Confirmation component", () => {
        expect(component).toBeDefined();
    });

    it("should return true when yes is clicked", () => {
        component.dialogRef.close = jasmine.createSpy("close");

        component.confirm();

        expect(component.dialogRef.close).toHaveBeenCalledWith(true);
    });
});
