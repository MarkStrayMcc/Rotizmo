import { CommonModule } from "@angular/common";
import { mount, MountResponse } from "cypress/angular";
import { SharedModule } from '@app/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BlastZoneFloatingValuesComponent } from './blast-zone-floating-values.component';
import { PropertyLimitFloatingValues } from '@app/quote/models/property-limit-floating-values.model';
import { ComponentFixture } from '@angular/core/testing';

/// <reference types="cypress" />

describe("Blast Zone Floating Values Component", () => {
    let blastZoneFloatingValuesComponent: BlastZoneFloatingValuesComponent;
    let componentFixture: ComponentFixture<BlastZoneFloatingValuesComponent>;
    let firstLossLimit = 1;
    let floatingValues: PropertyLimitFloatingValues = {
        lossOfRentLimit: 300,
        increasedCostOfWorkingLimit: 400,
        actualLossSustainedLimit: 500,
        alternativeAccommodationLimit: 600,
        contentsDamageLimit: 750
    };

    function mountComponent(){
        cy.mount(BlastZoneFloatingValuesComponent, {
            declarations: [BlastZoneFloatingValuesComponent],
            componentProperties: {
                floatingValues: floatingValues,
                firstLossLimit: firstLossLimit
            },
            imports: [CommonModule, SharedModule, BrowserAnimationsModule],
        }).then((component: MountResponse<BlastZoneFloatingValuesComponent>) => {
            blastZoneFloatingValuesComponent = component.fixture.componentInstance;
            componentFixture = component.fixture;
        });
    }

	beforeEach(() => {
        mountComponent();
	});

    it("should able to update first loss limit value", () => {
        cy.get("[id=firstLossLimit]").should("exist");
        cy.get("[id=firstLossLimit]").find('input').should("have.value", "1");
        firstLossLimit = 100;
        mountComponent();
        cy.get("[id=firstLossLimit]").find('input').should("have.value", "100");
    });

    it("should able to update floating values", () => {
        cy.get("[id=contentsDamageSum]").should("exist");
        cy.get("[id=lossRentSum]").should("exist");
        cy.get("[id=icowSumInsured]").should("exist");
        cy.get("[id=actualLossSustained]").should("exist");
        cy.get("[id=alternativeAccommodationLimit]").should("exist");

        cy.get("[id=contentsDamageSum]").find('input').should("have.value", "750");
        cy.get("[id=lossRentSum]").find('input').should("have.value", "300");
        cy.get("[id=icowSumInsured]").find('input').should("have.value", "400");
        cy.get("[id=actualLossSustained]").find('input').should("have.value", "500");
        cy.get("[id=alternativeAccommodationLimit]").find('input').should("have.value", "600");
    });
});
