import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { ControlValueAccessor, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { BrowserModule, By } from "@angular/platform-browser";
import * as Models from "@app/models";
import { Observable, from } from "rxjs";
import { BespokeClauseModalComponent } from "./bespoke-clause-modal.component";

describe("bespoke-clause-modal component",
    () => {
        let component: BespokeClauseModalComponent;
        let fixture: ComponentFixture<BespokeClauseModalComponent>;
        let matDialogRef: MatDialogRef<BespokeClauseModalComponent>;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [BespokeClauseModalComponent],
                imports: [
                    MatDialogModule,
                    BrowserModule,
                    FormsModule,
                    ReactiveFormsModule
                ],
                providers: [
                    { provide: MatDialogRef, useClass: MockMatDialogRef },
                    { provide: ComponentFixtureAutoDetect, useValue: true }
                ]
            }).compileComponents();
        }));

        beforeEach(() => {
            matDialogRef = TestBed.inject(MatDialogRef);
            fixture = TestBed.createComponent(BespokeClauseModalComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it("Should create component",
            () => {
                expect(component).toBeDefined();
            });

        it("Should close Material modal when closing modal",
            () => {
                // Actors
                spyOn(matDialogRef, "close");

                // Actions
                component.onCloseModal();

                // Asserts
                expect(matDialogRef.close).toHaveBeenCalledTimes(1);
            });

        it("Should close Material modal when saving",
            () => {
                // Actors
                spyOn(matDialogRef, "close");
                const clause = new Models.QuoteBespokeClauseExtended();

                // Actions
                component.save(clause, true);

                // Asserts
                expect(matDialogRef.close).toHaveBeenCalledTimes(1);
            });

        it("should have two form controls on initialisation",
            () => {
                expect(component.bespokeClauseForm.controls.clauseTitle).toBeDefined();
                expect(component.bespokeClauseForm.controls.clauseText).toBeDefined();
            });
    });

class MockMatDialogRef<T> {
    public close(dialogResult?: any): void { return; }
    public afterOpened = () => from([true]);
}
