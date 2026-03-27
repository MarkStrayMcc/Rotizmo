import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material";
import { MountResponse } from "cypress/angular";
import { SharedModule } from '@app/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BlastZoneCheckComponent } from './blast-zone-check.component';
import { InvalidBlastZoneChecks } from '@app/models/invalid-blast-zone-checks';
import { MultiplePropertyFixtures } from '../multiple-property-fixtures';

/// <reference types="cypress" />

var blastZoneCheckComponent: BlastZoneCheckComponent;
var invalidBlastZoneCheckResults = MultiplePropertyFixtures.getInvalidBlastZoneChecks();

function mountComponent(mockInvalidBlastZoneChecks: InvalidBlastZoneChecks[], mockValidBlastZoneCheckResultCount: number = 1) {
    cy.mount(BlastZoneCheckComponent, {
        declarations: [BlastZoneCheckComponent],
        componentProperties: {
            invalidBlastZoneChecks: mockInvalidBlastZoneChecks,
            validBlastZoneCheckResultCount: mockValidBlastZoneCheckResultCount
        },
        imports: [CommonModule, MatDialogModule, SharedModule, BrowserAnimationsModule],
    }).then((component: MountResponse<BlastZoneCheckComponent>) => {
        blastZoneCheckComponent = component.fixture.componentInstance;
    });
}

describe("Blast Zone Check Component", () => {

    it("should show matched addresses correctly", () => {
        mountComponent(invalidBlastZoneCheckResults);
        cy.get("[id=matched-addresses]").should("exist");
        cy.get("[id=matched-addresses]").should("have.text", "1 valid address");
        mountComponent(invalidBlastZoneCheckResults, 2);
        cy.get("[id=matched-addresses]").should("exist");
        cy.get("[id=matched-addresses]").should("have.text", "2 valid addresses");
    });

    it("should show invalid addresses correctly", () => {
        mountComponent(invalidBlastZoneCheckResults);
        cy.get("[id=matched-exceeding-addresses]").should("exist");
        cy.get("[id=matched-exceeding-addresses]").should("contain.text", "1 address exceeding blast zone");
        const multipleInvalidBlastZoneChecks = [invalidBlastZoneCheckResults[0], invalidBlastZoneCheckResults[0]];
        mountComponent(multipleInvalidBlastZoneChecks);
        cy.get("[id=matched-exceeding-addresses]").should("exist");
        cy.get("[id=matched-exceeding-addresses]").should("contain.text", "2 addresses exceeding blast zone");
    });

    it("should show Hide Limits and when click it should turn to Show Limits", () => {
        mountComponent(invalidBlastZoneCheckResults);
        cy.get("[id=hide-show-limits]").should("exist");
        cy.get("[id=hide-show-limits]").should("contain.text", "Hide Limits");
        cy.get("[id=accordion]").should("be.visible");
        cy.get("[id=accordion]").click();
        cy.get("[id=hide-show-limits]").should("be.visible");
        cy.get("[id=hide-show-limits]").click();
        cy.get("[id=hide-show-limits]").should("contain.text", "Show Limits");
    });

    it("should format available capacity correctly", () => {
        mountComponent(invalidBlastZoneCheckResults);
        cy.get("[id=accordion]").click();
        cy.get("[id=available-capacity]").should("contain.text","Available Capacity £10.0M");
    });
});
