import { LocationValidationResultsComponent } from './location-validation-results/location-validation-results.component';
import { DropzoneFileInputComponent } from './dropzone-file-input/dropzone-file-input.component';
import { CommonModule } from "@angular/common";
import { MatDialogModule, MatDialogRef } from "@angular/material";
import { Client, Quote } from "@app/models";
import { NavigationOverrideService } from "@app/services/navigation-override.service";
import { UserService } from "@app/services/user.service";
import { ToastrService, ToastType } from "@app/shared/toastr/toastr.service";
import { MountResponse } from "cypress/angular";
import { Observable, of } from "rxjs";
import { MultiplePropertyUploadModal } from "./multiple-property-upload-modal.component";
import { MultiplePropertyUploadHttpService } from "./multiple-property-upload.http-service";
import { QuoteService } from '@app/quote/services/quote.service';
import { BlastZoneHttpService } from '@app/services/blast-zone-http.service';
import { BinderValidationService } from '@app/services/binder-validation.service';
import { PropertyLimit } from '@app/quote/models/property-limit.model';
import { TemplateUploadResult } from '@app/models/template-upload-result';
import { BlastZoneCheckComponent } from './blast-zone-check/blast-zone-check.component';
import { SharedModule } from '@app/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BlastZoneCapacityResult, BlastZoneCheckResult } from '@app/models/blast-zone-check-result';
import { MultiplePropertyFixtures } from './multiple-property-fixtures';

/// <reference types="cypress" />

class MockMatDialogRef<T> {
    public close(dialogResult?: any): void {
        return;
    }
    public openDialog<T, TY>(obj) {
        return;
    }
    afterClosed() {
        return {
            afterClosed: () => of(true),
        };
    }
}

class MockNavigationOverrideService {
    public allowNavigation: boolean = false;
}

class MockMultiplePropertyUploadHttpService {
    public upload(file: File, clientId: number, wordingVersionId: number): Observable<PropertyLimit[]> {
        return of([]);
    }
}

class MockQuoteService {
    public getQuote(): Quote {
        return {
            inceptionDate: new Date('2024-01-01'),
            expiryDate: new Date('2025-01-01')
        } as Quote;
    }

    public getClient(): Client {
        return { id: 1 } as Client;
    }

    public getWordingVersionId(): Number {
        return 1;
    }
}

class MockUserService {
    public getUser() {
        return { initials: 'TEST' };
    }
}

class MockBinderValidationService {
    public getTerrorismBinderSectionId(): number {
        return 1289;
    }
}

var multiplePropertyComponent: MultiplePropertyUploadModal;
var blastZoneSpy;
var dialogRefSpy;
var toastrServiceSpy;

const blastZoneCapacityResult: BlastZoneCapacityResult = {
    hasCapacity: true,
    availableLimit: 1000
}

const blastZoneCheckResult: BlastZoneCheckResult[] = [{
    blastZoneCapacityResult: blastZoneCapacityResult,
    formattedAddress: "123 Fake Street",
    propertyLimit: {
        insuredAddress: MultiplePropertyFixtures.createUkAddress(),
        totalInsuredValue: 1000
    }
}];

function mountComponent(mockUploadResult: TemplateUploadResult) {

    blastZoneSpy = { checkPropertyLimitBlastCapacity: cy.stub().returns(of(blastZoneCheckResult)) };
    dialogRefSpy = new MockMatDialogRef();
    cy.spy(dialogRefSpy, 'close');
    
    toastrServiceSpy = new ToastrService();
    cy.spy(toastrServiceSpy, 'show');

    cy.mount(MultiplePropertyUploadModal, {
        declarations: [MultiplePropertyUploadModal, DropzoneFileInputComponent, LocationValidationResultsComponent, BlastZoneCheckComponent],
        componentProperties: {
            uploadResult: mockUploadResult
        },
        imports: [CommonModule, MatDialogModule, SharedModule, BrowserAnimationsModule],
        providers: [
            { provide: MatDialogRef, useValue: dialogRefSpy },
            { provide: NavigationOverrideService, useClass: MockNavigationOverrideService },
            { provide: MultiplePropertyUploadHttpService, useClass: MockMultiplePropertyUploadHttpService },
            { provide: QuoteService, useClass: MockQuoteService },
            { provide: BlastZoneHttpService, useValue: blastZoneSpy },
            { provide: ToastrService, useValue: toastrServiceSpy },
            { provide: UserService, useClass: MockUserService },
            { provide: BinderValidationService, useClass: MockBinderValidationService },
        ],
    }).then((component: MountResponse<MultiplePropertyUploadModal>) => {
        multiplePropertyComponent = component.fixture.componentInstance;
    });
}

function getFreshValidUploadResult(): TemplateUploadResult {
    return JSON.parse(JSON.stringify(MultiplePropertyFixtures.getTemplateUploadValidResult())) as TemplateUploadResult;
}

describe("Multiple Property Upload Modal Component", () => {
    const multiplePropertiesXlsxFilePath = "cypress/fixtures/TestTerrorismTemplate.xlsx";

    it("should mount component", () => {
        mountComponent(null);
        cy.get("[id=div-title]").should("exist");
        cy.get("[id=closeButton]").should("exist");
        cy.get('app-dropzone-file-input').should('exist');
        cy.get('app-location-validation-results').should('exist');
        cy.get('information-box').should('not.exist');
        cy.get('app-dropzone-file-input').should('be.visible');
        cy.get('app-location-validation-results').should('not.be.visible');
    });

    it("should select file and replace file successfully works", () => {
        mountComponent(null);
        cy.get("app-dropzone-file-input input[type='file']").selectFile(multiplePropertiesXlsxFilePath, { force: true });
        cy.get("app-dropzone-file-input").get("[id='replace-file']").should("be.visible");
        cy.get("app-dropzone-file-input").get("[id='replace-file']").click();
        cy.get("app-dropzone-file-input").get("[id='dropzone-file-label']").should("be.visible");
    });

    it("should show the location invalid validation results", () => {
        mountComponent(MultiplePropertyFixtures.getTemplateUploadInvalidResult());
        cy.get("app-location-validation-results").should("be.visible");
        cy.get("app-location-validation-results").get("[id='error-results']").should("be.visible");
        cy.get("app-location-validation-results").get("[id='error-results']").should("have.text", "1 error");
        cy.get("app-location-validation-results").get("[id='matched-addresses']").should("be.visible");
        cy.get("app-location-validation-results").get("[id='matched-addresses']").should("have.text", "1 address matched");
    });

    it("should show the location valid validation results", () => {
        mountComponent(MultiplePropertyFixtures.getTemplateUploadInvalidResult());
        cy.get("app-location-validation-results").should("be.visible");
        cy.get("app-location-validation-results").should("not.contain", "[id='error-results']");
        cy.get("app-location-validation-results").get("[id='matched-addresses']").should("be.visible");
        cy.get("app-location-validation-results").get("[id='matched-addresses']").should("have.text", "1 address matched");
    });

    it("blast zone step should be checked when continue clicked", () => {
        mountComponent(MultiplePropertyFixtures.getTemplateUploadValidResult());
        cy.get("[id=continue]").click();
        cy.wrap(blastZoneSpy.checkPropertyLimitBlastCapacity).should('have.been.calledOnce');
        cy.get("[id=blast-zone-information-box]").should("not.exist");
    })

    it("add locations should not be enabled when blast zone check return invalid", () => {
        mountComponent(MultiplePropertyFixtures.getTemplateUploadValidResult());
        const invalidBlastZoneCheckResult = [{
            blastZoneCapacityResult: {
                hasCapacity: false,
                availableLimit: 1000
            },
            formattedAddress: "123 Fake Street",
            propertyLimit: {
                insuredAddress: MultiplePropertyFixtures.createUkAddress(),
                totalInsuredValue: 1000
            }
        }];
        blastZoneSpy.checkPropertyLimitBlastCapacity.returns(of(invalidBlastZoneCheckResult));
        cy.get("[id=continue]").click();
        cy.get("[id=add-locations]").should("be.disabled");
        cy.get("[id=blast-zone-information-box]").should("exist");
        cy.get("[id=blast-zone-information-box]").should("contain.text", "Review limits for addresses exceeding blast zone to continue.");
    })

    it("re-check blast zone should trigger check when there are no existing blast zone results", () => {
        mountComponent(getFreshValidUploadResult());

        cy.then(() => {
            multiplePropertyComponent.firstLossLimitChanged = true;
            multiplePropertyComponent.reCheckBlastZone();
        });

        cy.wrap(blastZoneSpy.checkPropertyLimitBlastCapacity).should('have.been.calledOnce');
    })

    it("Upload template fails template validation, should close dialog and show error toast", () => {
        mountComponent(null);
        
        cy.then(() => {
            // Act: Call setUploadResult with template validation error
            multiplePropertyComponent.setUploadResult(MultiplePropertyFixtures.getTemplateUploadValidationFailedForTemplate());
        });
        
        // Assert: Verify dialog was closed
        cy.wrap(dialogRefSpy.close).should('have.been.calledOnce');
        
        // Assert: Verify ToastrService.show was called with the correct error message and type
        cy.wrap(toastrServiceSpy.show).should('have.been.calledOnce');
        cy.wrap(toastrServiceSpy.show).should('have.been.calledWith', 'test', ToastType.Error);
    })

    it("Prior Submit step should appear when upload result contains prior submit locations", () => {
        const resultWithPriorSubmit = getFreshValidUploadResult();
        resultWithPriorSubmit.propertyLimits[0].priorCarrierApprovalRequired = true;
        mountComponent(resultWithPriorSubmit);

        cy.get("[id=continue]").click();
        cy.get("[id=blast-zone-continue]").should("be.visible").click();
        cy.get("[id=prior-submit-continue]").should("be.visible");
    })

    it("Prior Submit step should not appear when upload result has no prior submit locations", () => {
        mountComponent(getFreshValidUploadResult());
        cy.get("[id=continue]").click();
        cy.contains("Blast Zone Check").should("be.visible");
        cy.contains("Prior Submit Check").should("not.exist");
    })

    it("Prior Submit Continue button should be disabled until Resolve checkbox is checked", () => {
        const resultWithPriorSubmit = getFreshValidUploadResult();
        resultWithPriorSubmit.propertyLimits[0].priorCarrierApprovalRequired = true;
        mountComponent(resultWithPriorSubmit);

        cy.get("[id=continue]").click();
        cy.get("[id=blast-zone-continue]").should("be.visible").click();
        cy.get("[id=prior-submit-continue]").should("be.visible").and("be.disabled");
        cy.contains("label", "Resolve").click();
        cy.get("[id=prior-submit-continue]").should("not.be.disabled");
    })

    it("Prior Submit Resolve checkbox should enable Continue button", () => {
        const resultWithPriorSubmit = getFreshValidUploadResult();
        resultWithPriorSubmit.propertyLimits[0].priorCarrierApprovalRequired = true;
        mountComponent(resultWithPriorSubmit);

        cy.get("[id=continue]").click();
        cy.get("[id=blast-zone-continue]").should("be.visible").click();
        cy.get("[id=prior-submit-resolve]").should("not.be.checked");
        cy.contains("label", "Resolve").click();
        cy.get("[id=prior-submit-resolve]").should("be.checked");
        cy.get("[id=prior-submit-continue]").should("not.be.disabled").and("have.class", "tw-bg-cfc-bright-blue");
    })

    it("Prior Submit Back button should return to Blast Zone step", () => {
        const resultWithPriorSubmit = getFreshValidUploadResult();
        resultWithPriorSubmit.propertyLimits[0].priorCarrierApprovalRequired = true;
        mountComponent(resultWithPriorSubmit);

        cy.get("[id=continue]").click();
        cy.get("[id=blast-zone-continue]").should("be.visible").click();
        cy.get("[id=prior-submit-back]").click();
        cy.get("[id=blast-zone-continue]").should("be.visible");
    })

    it("Prior Submit Continue should add locations", () => {
        const resultWithPriorSubmit = getFreshValidUploadResult();
        resultWithPriorSubmit.propertyLimits[0].priorCarrierApprovalRequired = true;
        mountComponent(resultWithPriorSubmit);

        cy.get("[id=continue]").click();
        cy.get("[id=blast-zone-continue]").should("be.visible").click();
        cy.contains("label", "Resolve").click();
        cy.get("[id=prior-submit-continue]").click();
        cy.wrap(blastZoneSpy.checkPropertyLimitBlastCapacity).should('have.been.calledOnce');
        cy.wrap(dialogRefSpy.close).should('have.been.calledOnce');
    })

    it("Prior Submit locations should be listed with formatted addresses", () => {
        const resultWithPriorSubmit = getFreshValidUploadResult();
        resultWithPriorSubmit.propertyLimits[0].priorCarrierApprovalRequired = true;
        resultWithPriorSubmit.propertyLimits[0].formattedAddress = "123 Test Street, Test City";
        resultWithPriorSubmit.propertyLimits[0].rowNumber = 1;
        mountComponent(resultWithPriorSubmit);

        cy.then(() => {
            multiplePropertyComponent.setUploadedFileName("test-file.xlsx");
        });

        cy.get("[id=continue]").click();
        cy.get("[id=blast-zone-continue]").should("be.visible").click();
        cy.get("[id=file-name]").should("be.visible").and("contain", "test-file.xlsx");
        cy.contains("1 Prior Submit location found").should("exist");
        cy.contains("Row 1").should("exist");
        cy.contains("123 Test Street, Test City").should("exist");
    })

    it("re-check button should not appear after initial blast zone check when all locations pass", () => {
        mountComponent(getFreshValidUploadResult());
        cy.get("[id=continue]").click();

        cy.then(() => {
            expect(multiplePropertyComponent.floatingValuesChanged).to.equal(false);
            expect(multiplePropertyComponent.shouldShowReCheckButton()).to.equal(false);
        });

        cy.get("[id=add-locations]").should("not.be.disabled");
        cy.get("[id=recheck-blastzone]").should("not.exist");
    })

    it("floating values change should set floatingValuesChanged and show re-check button", () => {
        mountComponent(getFreshValidUploadResult());
        cy.get("[id=continue]").click();

        cy.then(() => {
            multiplePropertyComponent.propertyLimitFloatingValues.contentsDamageLimit = 500;
            multiplePropertyComponent.onFloatingValuesChanged();
        });

        cy.then(() => {
            expect(multiplePropertyComponent.floatingValuesChanged).to.equal(true);
            expect(multiplePropertyComponent.shouldShowReCheckButton()).to.equal(true);
        });
    })

    it("floating values change guard should not set flag when sum is unchanged", () => {
        mountComponent(getFreshValidUploadResult());
        cy.get("[id=continue]").click();

        cy.then(() => {
            multiplePropertyComponent.onFloatingValuesChanged();
            expect(multiplePropertyComponent.floatingValuesChanged).to.equal(false);
        });
    })

    it("re-check blast zone should trigger API and reset floatingValuesChanged when floating values change", () => {
        mountComponent(getFreshValidUploadResult());
        cy.get("[id=continue]").click();

        cy.then(() => {
            multiplePropertyComponent.propertyLimitFloatingValues.contentsDamageLimit = 500;
            multiplePropertyComponent.onFloatingValuesChanged();
            blastZoneSpy.checkPropertyLimitBlastCapacity.resetHistory();
            multiplePropertyComponent.reCheckBlastZone();
        });

        cy.wrap(blastZoneSpy.checkPropertyLimitBlastCapacity).should('have.been.calledOnce');
        cy.then(() => {
            expect(multiplePropertyComponent.floatingValuesChanged).to.equal(false);
        });
    })

    it("Add Locations button should be enabled when no floating values are present in uploaded spreadsheet", () => {
        mountComponent(getFreshValidUploadResult());
        cy.get("[id=continue]").click();

        cy.get("[id=add-locations]").should("not.be.disabled");
        cy.get("[id=recheck-blastzone]").should("not.exist");
    })

    it("Add Locations button should be enabled when floating values are pre-populated from uploaded spreadsheet", () => {
        const resultWithFloatingValues = getFreshValidUploadResult();
        resultWithFloatingValues.propertyLimitFloatingValues = {
            contentsDamageLimit: 1000,
            actualLossSustainedLimit: 2000,
            increasedCostOfWorkingLimit: 500,
        };

        mountComponent(resultWithFloatingValues);
        cy.get("[id=continue]").click();

        cy.get("[id=add-locations]").should("not.be.disabled");
        cy.get("[id=recheck-blastzone]").should("not.exist");
    })

    it("Add Locations button should be disabled and Re-check should appear when user updates floating values", () => {
        mountComponent(getFreshValidUploadResult());
        cy.get("[id=continue]").click();

        cy.then(() => {
            multiplePropertyComponent.propertyLimitFloatingValues.contentsDamageLimit = 500;
            multiplePropertyComponent.onFloatingValuesChanged();
        });

        cy.get("[id=add-locations]").should("be.disabled");
        cy.get("[id=recheck-blastzone]").should("exist");
    })

    it("Add Locations button should be disabled and Re-check should appear when user updates pre-populated floating values", () => {
        const resultWithFloatingValues = getFreshValidUploadResult();
        resultWithFloatingValues.propertyLimitFloatingValues = {
            contentsDamageLimit: 1000,
            actualLossSustainedLimit: 2000,
        };

        mountComponent(resultWithFloatingValues);
        cy.get("[id=continue]").click();

        cy.then(() => {
            multiplePropertyComponent.propertyLimitFloatingValues.contentsDamageLimit = 5000;
            multiplePropertyComponent.onFloatingValuesChanged();
        });

        cy.get("[id=add-locations]").should("be.disabled");
        cy.get("[id=recheck-blastzone]").should("exist");
    })

    it("Add Locations button should re-enable after Re-check is clicked following floating values change", () => {
        mountComponent(getFreshValidUploadResult());
        cy.get("[id=continue]").click();

        cy.then(() => {
            multiplePropertyComponent.propertyLimitFloatingValues.contentsDamageLimit = 500;
            multiplePropertyComponent.onFloatingValuesChanged();
        });

        cy.get("[id=recheck-blastzone]").should("exist").click();
        cy.get("[id=add-locations]").should("not.be.disabled");
        cy.get("[id=recheck-blastzone]").should("not.exist");
    })

    it("Blast Zone step icon should reset when file is replaced", () => {
        const resultWithPriorSubmit = getFreshValidUploadResult();
        resultWithPriorSubmit.propertyLimits[0].priorCarrierApprovalRequired = true;
        mountComponent(resultWithPriorSubmit);

        cy.get("[id=continue]").click();
        cy.get("[id=blast-zone-continue]").should("be.visible").click();
        cy.get("label.label-checkbox[for='prior-submit-resolve']").click();
        cy.get("[id=prior-submit-continue]").should("not.be.disabled").click();
        cy.wrap(blastZoneSpy.checkPropertyLimitBlastCapacity).should('have.been.calledOnce');

        // Simulate replacing the file via upload result reset
        cy.then(() => {
            multiplePropertyComponent.setUploadResult(getFreshValidUploadResult());
        });

        // Verify Blast Zone state is reset after replacement
        cy.then(() => {
            expect(multiplePropertyComponent.validBlastZoneCheckResultCount).to.equal(0);
            expect(multiplePropertyComponent.invalidBlastZoneChecks.length).to.equal(0);
            expect(multiplePropertyComponent.priorSubmitResolved).to.equal(false);
        });
    })
});
