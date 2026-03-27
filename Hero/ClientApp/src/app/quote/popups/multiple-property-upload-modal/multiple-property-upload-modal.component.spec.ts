import { MatDialogRef } from "@angular/material/dialog";
import { ToastType, ToastrService } from "@app/shared/toastr/toastr.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { BlastZoneHttpService } from "@app/services/blast-zone-http.service";
import { UserService } from "@app/services/user.service";
import { BinderValidationService } from "@app/services/binder-validation.service";
import { MultiplePropertyUploadModal } from "./multiple-property-upload-modal.component";
import { of } from "rxjs";
import { TemplateUploadResult } from "@app/models/template-upload-result";
import { PropertyLimit } from "@app/quote/models/property-limit.model";

describe("MultiplePropertyUploadModal", () => {
    let component: MultiplePropertyUploadModal;

    let dialogueRefSpy: jasmine.SpyObj<MatDialogRef<MultiplePropertyUploadModal>>;
    let toastrSpy: jasmine.SpyObj<ToastrService>;
    let quoteServiceSpy: jasmine.SpyObj<QuoteService>;
    let blastZoneHttpServiceSpy: jasmine.SpyObj<BlastZoneHttpService>;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let binderValidationServiceSpy: jasmine.SpyObj<BinderValidationService>;

    const quote = {
        inceptionDate: new Date("2026-01-01"),
        expiryDate: new Date("2027-01-01"),
        currency: { isoCode: "USD" },
        propertyLimits: [{ blastZoneReservationId: "RES-123" }],
    } as any;

    const createPropertyLimit = (ratingReference: string, totalInsuredValue = 1000): PropertyLimit => ({
        ratingReference,
        propertyLimitId: 1,
        totalInsuredValue,
        insuredAddress: {
            countryId: 1,
            clientLocationId: 1,
            clientId: 1,
            address1: "address1",
            address2: "",
            address3: "",
            city: "city",
            postcode: "postcode",
            isPrimaryLocation: true,
            stateProvinceCode: "state",
            county: "county",
            disabledOn: null,
            country: null,
        },
        propertyDamageLimit: 100,
        contentsDamageLimit: 100,
        actualLossSustainedLimit: 100,
        increasedCostOfWorkingLimit: 100,
        lossOfRentLimit: 100,
        alternativeAccommodationLimit: 100,
    });

    beforeEach(() => {
        dialogueRefSpy = jasmine.createSpyObj("MatDialogRef", ["close"]);
        toastrSpy = jasmine.createSpyObj("ToastrService", ["show"]);
        quoteServiceSpy = jasmine.createSpyObj("QuoteService", ["getQuote"]);
        blastZoneHttpServiceSpy = jasmine.createSpyObj("BlastZoneHttpService", ["checkPropertyLimitBlastCapacity"]);
        userServiceSpy = jasmine.createSpyObj("UserService", ["getUser"]);
        binderValidationServiceSpy = jasmine.createSpyObj("BinderValidationService", ["getTerrorismBinderSectionId"]);

        quoteServiceSpy.getQuote.and.returnValue(quote);
        userServiceSpy.getUser.and.returnValue({ initials: "AB" } as any);
        blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity.and.returnValue(of([]));
        binderValidationServiceSpy.getTerrorismBinderSectionId.and.returnValue(1289);

        component = new MultiplePropertyUploadModal(
            dialogueRefSpy,
            toastrSpy,
            quoteServiceSpy,
            blastZoneHttpServiceSpy,
            userServiceSpy,
            binderValidationServiceSpy,
        );
    });

    it("should create component", () => {
        expect(component).toBeTruthy();
    });

    it("doBlastZoneCheck should send binderSectionId and quoteCurrencyIsoCode in blast zone request", () => {
        component.binderSectionId = 1289;
        component.firstLossLimitValue = 500;
        const floatingValues = {
            contentsDamageLimit: 10,
            actualLossSustainedLimit: 20,
        };
        component.uploadResult = {
            propertyLimits: [createPropertyLimit("R1")],
            propertyLimitFloatingValues: floatingValues,
            validationResults: [],
        } as TemplateUploadResult;
        component.propertyLimitFloatingValues = floatingValues as any;

        component.doBlastZoneCheck();

        expect(blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity).toHaveBeenCalledTimes(1);
        const request = blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity.calls.mostRecent().args[0];
        expect(request.binderSectionId).toBe(1289);
        expect(request.quoteCurrencyIsoCode).toBe("USD");
        expect(request.originalGroupId).toBe("RES-123");
        expect(request.firstLossLimitValue).toBe(500);
        expect(request.floatingValue).toBe(30);
    });

    it("reCheckBlastZone should set warning and skip API call when first loss limit exceeds max", () => {
        component.firstLossLimitValue = component.maximumLocationTivValue + 1;
        component.firstLossLimitChanged = true;
        component.uploadResult = {
            propertyLimits: [createPropertyLimit("R1")],
            propertyLimitFloatingValues: {},
            validationResults: [],
        } as TemplateUploadResult;

        component.reCheckBlastZone();

        expect(component.hasFirstLossLimitWarning).toBeTruthy();
        expect(component.firstLossLimitWarningMessage).toContain("cannot exceed");
        expect(blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity).not.toHaveBeenCalled();
    });

    it("reCheckBlastZone should set warning and skip API call when first loss is zero and a location TIV exceeds max", () => {
        component.firstLossLimitValue = 0;
        component.firstLossLimitChanged = true;
        component.uploadResult = {
            propertyLimits: [createPropertyLimit("R1", component.maximumLocationTivValue + 1)],
            propertyLimitFloatingValues: {},
            validationResults: [],
        } as TemplateUploadResult;

        component.reCheckBlastZone();

        expect(component.hasFirstLossLimitWarning).toBeTruthy();
        expect(component.firstLossLimitWarningMessage).toContain("TIV Value cannot exceed");
        expect(blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity).not.toHaveBeenCalled();
    });

    it("reCheckBlastZone should call API with binderSectionId and quoteCurrencyIsoCode when inputs changed", () => {
        component.binderSectionId = 1400;
        component.firstLossLimitValue = 1000;
        component.firstLossLimitChanged = true;
        const floatingValues = {
            contentsDamageLimit: 5,
            actualLossSustainedLimit: 15,
        };
        component.uploadResult = {
            propertyLimits: [createPropertyLimit("R1")],
            propertyLimitFloatingValues: floatingValues,
            validationResults: [],
        } as TemplateUploadResult;
        component.propertyLimitFloatingValues = floatingValues as any;

        component.reCheckBlastZone();

        expect(blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity).toHaveBeenCalledTimes(1);
        const request = blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity.calls.mostRecent().args[0];
        expect(request.binderSectionId).toBe(1400);
        expect(request.quoteCurrencyIsoCode).toBe("USD");
        expect(request.firstLossLimitValue).toBe(1000);
        expect(request.floatingValue).toBe(20);
    });

    it("setUploadResult(null) should reset modal state", () => {
        component.firstStepLabel = "Location validation";
        component.firstLossLimitValue = 123;
        component.firstLossLimitChanged = true;
        component.hasFirstLossLimitWarning = true;
        component.hasPerformedInitialBlastZoneCheck = true;
        component.uploadResult = {
            propertyLimits: [createPropertyLimit("R1")],
            validationResults: [],
        } as TemplateUploadResult;

        component.setUploadResult(null as any);

        expect(component.uploadResult).toBeNull();
        expect(component.firstStepLabel).toBe("Upload Locations");
        expect(component.firstLossLimitValue).toBeUndefined();
        expect(component.firstLossLimitChanged).toBeFalsy();
        expect(component.hasFirstLossLimitWarning).toBeFalsy();
        expect(component.hasPerformedInitialBlastZoneCheck).toBeFalsy();
    });

    it("setUploadResult should close dialogue and show toast when template has validation error", () => {
        const uploadResult = {
            templateValidationError: "Template mismatch",
            propertyLimits: [],
            validationResults: [],
        } as TemplateUploadResult;

        component.setUploadResult(uploadResult);

        expect(dialogueRefSpy.close).toHaveBeenCalled();
        expect(toastrSpy.show).toHaveBeenCalledWith("Template mismatch", ToastType.Error);
        expect(component.uploadResult).toBeUndefined();
    });

    it("setUploadResult(null) should reset floatingValuesChanged", () => {
        component.floatingValuesChanged = true;

        component.setUploadResult(null as any);

        expect(component.floatingValuesChanged).toBeFalsy();
    });

    describe("spreadsheet upload scenarios", () => {
        const successBlastZoneResult = [
            { blastZoneCapacityResult: { hasCapacity: true }, propertyLimit: createPropertyLimit("R1") }
        ];

        beforeEach(() => {
            blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity.and.returnValue(of(successBlastZoneResult));
        });

        it("should enable Add Locations when no floating values are present in uploaded spreadsheet", () => {
            const uploadResult = {
                propertyLimits: [createPropertyLimit("R1")],
                validationResults: [],
                propertyLimitFloatingValues: undefined,
            } as TemplateUploadResult;

            component.setUploadResult(uploadResult);
            component.doBlastZoneCheck();
            component.onFloatingValuesChanged();

            expect(component.floatingValuesChanged).toBeFalsy();
            expect(component.firstLossLimitChanged).toBeFalsy();
            expect(component.isAnyExceededCapacity()).toBeFalsy();
            expect(component.shouldShowReCheckButton()).toBeFalsy();
        });

        it("should enable Add Locations when floating values are pre-populated from uploaded spreadsheet", () => {
            const uploadResult = {
                propertyLimits: [createPropertyLimit("R1")],
                validationResults: [],
                propertyLimitFloatingValues: {
                    contentsDamageLimit: 1000,
                    actualLossSustainedLimit: 2000,
                    increasedCostOfWorkingLimit: 500,
                },
            } as TemplateUploadResult;

            component.setUploadResult(uploadResult);
            component.doBlastZoneCheck();
            component.onFloatingValuesChanged();

            expect(component.floatingValuesChanged).toBeFalsy();
            expect(component.firstLossLimitChanged).toBeFalsy();
            expect(component.isAnyExceededCapacity()).toBeFalsy();
            expect(component.shouldShowReCheckButton()).toBeFalsy();
        });

        it("should disable Add Locations and show Re-check when user updates pre-populated floating values", () => {
            const uploadResult = {
                propertyLimits: [createPropertyLimit("R1")],
                validationResults: [],
                propertyLimitFloatingValues: {
                    contentsDamageLimit: 1000,
                    actualLossSustainedLimit: 2000,
                },
            } as TemplateUploadResult;

            component.setUploadResult(uploadResult);
            component.doBlastZoneCheck();

            component.propertyLimitFloatingValues.contentsDamageLimit = 5000;
            component.onFloatingValuesChanged();

            expect(component.floatingValuesChanged).toBeTruthy();
            expect(component.shouldShowReCheckButton()).toBeTruthy();
        });

        it("should disable Add Locations and show Re-check when user adds floating values where none existed", () => {
            const uploadResult = {
                propertyLimits: [createPropertyLimit("R1")],
                validationResults: [],
                propertyLimitFloatingValues: undefined,
            } as TemplateUploadResult;

            component.setUploadResult(uploadResult);
            component.doBlastZoneCheck();

            component.propertyLimitFloatingValues.contentsDamageLimit = 500;
            component.onFloatingValuesChanged();

            expect(component.floatingValuesChanged).toBeTruthy();
            expect(component.shouldShowReCheckButton()).toBeTruthy();
        });
    });

    describe("floating values change detection", () => {
        beforeEach(() => {
            component.uploadResult = {
                propertyLimits: [createPropertyLimit("R1")],
                propertyLimitFloatingValues: {
                    contentsDamageLimit: 100,
                    actualLossSustainedLimit: 200,
                },
                validationResults: [],
            } as TemplateUploadResult;
            component.propertyLimitFloatingValues = component.uploadResult.propertyLimitFloatingValues;

            blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity.and.returnValue(of([
                { blastZoneCapacityResult: { hasCapacity: true }, propertyLimit: createPropertyLimit("R1") }
            ]));
            component.doBlastZoneCheck();
            blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity.calls.reset();
        });

        it("onFloatingValuesChanged should set floatingValuesChanged when floating value sum changes", () => {
            component.propertyLimitFloatingValues.contentsDamageLimit = 999;

            component.onFloatingValuesChanged();

            expect(component.floatingValuesChanged).toBeTruthy();
        });

        it("onFloatingValuesChanged should not set floatingValuesChanged when sum is unchanged", () => {
            component.onFloatingValuesChanged();

            expect(component.floatingValuesChanged).toBeFalsy();
        });

        it("shouldShowReCheckButton should return true when floatingValuesChanged is true", () => {
            component.floatingValuesChanged = true;

            expect(component.shouldShowReCheckButton()).toBeTruthy();
        });

        it("shouldShowReCheckButton should return false when no changes and no exceeded capacity", () => {
            expect(component.shouldShowReCheckButton()).toBeFalsy();
        });

        it("reCheckBlastZone should call API when floatingValuesChanged is true", () => {
            component.propertyLimitFloatingValues.contentsDamageLimit = 500;
            component.onFloatingValuesChanged();

            component.reCheckBlastZone();

            expect(blastZoneHttpServiceSpy.checkPropertyLimitBlastCapacity).toHaveBeenCalledTimes(1);
        });

        it("reCheckBlastZone should reset floatingValuesChanged after triggering check", () => {
            component.propertyLimitFloatingValues.contentsDamageLimit = 500;
            component.onFloatingValuesChanged();

            component.reCheckBlastZone();

            expect(component.floatingValuesChanged).toBeFalsy();
        });
    });
});
