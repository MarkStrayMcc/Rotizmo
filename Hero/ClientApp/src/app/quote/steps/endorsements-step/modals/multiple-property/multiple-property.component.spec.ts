import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { Quote } from "@app/models";
import { QuoteModule } from "@app/quote/quote.module";
import { InsuredAddressService } from "@app/quote/steps/endorsements-step/modals/multiple-property/property-limit/insured-address/insured-address.service";
import { Guid } from "guid-typescript";
import { of } from "rxjs";
import { Shallow } from "shallow-render";
import { getTestQuote } from "test-helpers";
import { MultiplePropertyComponent } from "./multiple-property.component";
import { PropertyLimit } from "../../../../models/property-limit.model";

describe("MultiplePropertyComponent", () => {
    let shallow: Shallow<MultiplePropertyComponent>;

    beforeEach(() => {
        shallow = new Shallow(MultiplePropertyComponent, QuoteModule)
            .mock(MatDialogRef, { close: () => { } })
            .mock(InsuredAddressService, { get: () => of(null) });
    });

    describe("constructor", () => {
        let component: MultiplePropertyComponent;

        beforeEach(async () => {
            const { instance } = await shallow.render({ detectChanges: false });
            component = instance;
        });

        it("should create component", () => {
            expect(component).toBeDefined();
        });

        it("should create an empty form group and controls", () => {
            expect(component.formGroup.controls.propertyLimits).toBeDefined();
        });
    });

    describe("ngOnInit", () => {
        let component: MultiplePropertyComponent;
        let componentFixture: ComponentFixture<MultiplePropertyComponent>;
        let inputs: { quote: Quote };

        let mockInsuredAddressService: InsuredAddressService;

        beforeEach(async () => {
            const { instance, fixture, bindings } = await shallow.render({ detectChanges: false, bind: { quote: getTestQuote() } });

            component = instance;
            componentFixture = fixture;
            inputs = bindings;

            mockInsuredAddressService = TestBed.inject(InsuredAddressService);
        });

        it("should get the insured addresses by client ID", () => {
            // Act
            componentFixture.detectChanges();

            // Arrange
            expect(mockInsuredAddressService.get).toHaveBeenCalledTimes(1);
            expect(mockInsuredAddressService.get).toHaveBeenCalledWith(component.quote.client.id);
        });

        it("should create a component for each property limits", () => {
            // Arrange
            const expectedPropertyLimit1 = <PropertyLimit>{ propertyDamageLimit: 9 };
            const expectedPropertyLimit2 = <PropertyLimit>{ propertyDamageLimit: 11 };

            inputs.quote.propertyLimits = [expectedPropertyLimit1, expectedPropertyLimit2];

            // Act
            componentFixture.detectChanges();

            // Arrange
            expect(component.propertyLimits.controls[0].value).toBe(expectedPropertyLimit1);
            expect(component.propertyLimits.controls[1].value).toBe(expectedPropertyLimit2);
            expect(Guid.isGuid(component.propertyLimits.controls[0].id)).toBe(true);
            expect(Guid.isGuid(component.propertyLimits.controls[1].id)).toBe(true);
        });
    });

    describe("initialised", () => {
        let component: MultiplePropertyComponent;
        let mockDialogRef: MatDialogRef<MultiplePropertyComponent>;

        beforeEach(async () => {
            const { instance } = await shallow.render({ bind: { quote: getTestQuote() } });

            component = instance;
            mockDialogRef = TestBed.inject(MatDialogRef);
        });

        describe("isSaveButtonDisabled", () => {
            it("should disabled the save button when there are no property limits", () => {
                expect(component.isSaveButtonDisabled).toBe(true);
            });

            it("should disabled the save button when a property limit is being edited", () => {
                // Arrange
                const currentlyEditingPropertyLimit = new FormControl();

                currentlyEditingPropertyLimit.isEditing = true;
                component.propertyLimits.push(currentlyEditingPropertyLimit);

                // Assert
                expect(component.isSaveButtonDisabled).toBe(true);
            });

            it("should enable the save button when at least 1 property limit is added and no property limit are being edited", () => {
                // Arrange
                const existingPropertyLimit = new FormControl();

                existingPropertyLimit.isNew = false;
                existingPropertyLimit.isEditing = false;
                component.propertyLimits.push(existingPropertyLimit);

                // Assert
                expect(component.isSaveButtonDisabled).toBe(false);
            });
        });

        describe("create", () => {
            it("should create a new property limit", () => {
                // Act
                component.create();

                // Assert
                expect(component.propertyLimits.controls.length).toBe(1);
                expect(component.propertyLimits.controls[0].isNew).toBe(true);
                expect(component.propertyLimits.controls[0].isEditing).toBe(true);
                expect(Guid.isGuid(component.propertyLimits.controls[0].id)).toBe(true);
            });

            it("should set only the newly created property limit to be in edit mode", () => {
                // Arrange
                const previouslyEditedPropertyLimit = new FormControl();

                previouslyEditedPropertyLimit.isEditing = true;
                component.propertyLimits.push(previouslyEditedPropertyLimit);

                // Act
                component.create();

                // Assert
                expect(component.propertyLimits.controls.length).toBe(2);
                expect(component.propertyLimits.controls[0].id).toBe(previouslyEditedPropertyLimit.id);
                expect(component.propertyLimits.controls[0].isEditing).toBe(false);
                expect(component.propertyLimits.controls[1].isEditing).toBe(true);
                expect(component.propertyLimits.controls[1].isNew).toBe(true);
            });

            it("should not create a new property limit when a new unfinished one exists", () => {
                // Arrange
                const newPropertyLimits = new FormControl();

                newPropertyLimits.isNew = true;
                component.propertyLimits.push(newPropertyLimits);

                // Act
                component.create();

                // Assert
                expect(component.propertyLimits.controls.length).toBe(1);
                expect(component.propertyLimits.controls[0].id).toBe(newPropertyLimits.id);
            });
        });

        describe("save", () => {
            it("should update the property limits on the quote", () => {
                // Arrange
                const expectedPropertyLimits = [<PropertyLimit>{ grossRentalLimit: 91 }];

                for (const expectedPropertyLimit of expectedPropertyLimits) {
                    component.propertyLimits.push(new FormControl(expectedPropertyLimit));
                }

                // Act
                component.save();

                // Assert
                expect(component.quote.propertyLimits).toEqual(expectedPropertyLimits);
            });

            it("should close the dialog with updated quote", () => {
                // Act
                component.save();

                // Assert
                expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
                expect(mockDialogRef.close).toHaveBeenCalledWith(component.quote);
            });
        });

        describe("delete", () => {
            it("should delete matching property limit from list", () => {
                // Arrange
                const propertyLimitToDelete = new FormControl();
                const propertyLimitToKeep = new FormControl();

                propertyLimitToDelete.id = Guid.create();
                propertyLimitToKeep.id = Guid.create();

                component.propertyLimits.push(propertyLimitToDelete);
                component.propertyLimits.push(propertyLimitToKeep);

                // Act
                component.delete(propertyLimitToDelete.id);

                // Assert
                expect(component.propertyLimits.controls.length).toBe(1);
                expect(component.propertyLimits.controls[0].id).toBe(propertyLimitToKeep.id);
            });
        });

        describe("close", () => {
            it("should close the dialog", () => {
                // Act
                component.close();

                // Assert
                expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
                expect(mockDialogRef.close).toHaveBeenCalledWith();
            });
        });
    });
});
