import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationValidationResultsComponent } from './location-validation-results.component';
import { TemplateUploadResult } from '@app/models/template-upload-result';
import { MultiplePropertyFixtures } from '../multiple-property-fixtures';

const mockTemplateUploadResult : TemplateUploadResult = {
    propertyLimits: [
        {
            insuredAddress:MultiplePropertyFixtures.createUkAddress(),
            totalInsuredValue: 1000,
        }
    ],
    validationResults: [
        {
            validationAddress: "123 Fake Street",
            locationIdentifier: "Row 1",
            isValid: false,
            errors: [
                {
                    errorCode: "123",
                    errorMessage: "Address line 1 is required",
                }
            ],
        }
    ],
}

describe('LocationValidationResultsComponent', () => {
    let component: LocationValidationResultsComponent;
    let fixture: ComponentFixture<LocationValidationResultsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LocationValidationResultsComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LocationValidationResultsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the correct wording for single matched address', () => {
        component.uploadResult = mockTemplateUploadResult;
        fixture.detectChanges();
        const matchedAddressesSpan: HTMLSpanElement | null = fixture.debugElement.nativeElement.querySelector('#matched-addresses');
        expect(matchedAddressesSpan).not.toBeNull();
        expect(matchedAddressesSpan.textContent).toBe('1 address matched');
    });

    it('should display the correct wording for multiple matched addresses', () => {
         const mockTemplateUploadResultForMultipleAddresses = { propertyLimits:[... mockTemplateUploadResult.propertyLimits, ... mockTemplateUploadResult.propertyLimits], validationResults: mockTemplateUploadResult.validationResults };
        component.uploadResult = mockTemplateUploadResultForMultipleAddresses;
        fixture.detectChanges();
        const matchedAddressesSpan: HTMLSpanElement | null = fixture.debugElement.nativeElement.querySelector('#matched-addresses');

        expect(matchedAddressesSpan).not.toBeNull();
        expect(matchedAddressesSpan.textContent).toBe('2 addresses matched');
    });

    it('should display the correct wording for single validation error', () => {
        component.uploadResult = mockTemplateUploadResult;
        fixture.detectChanges();
        const errorResultsSpan: HTMLSpanElement | null = fixture.debugElement.nativeElement.querySelector('#error-results');
        expect(errorResultsSpan).not.toBeNull();
        expect(errorResultsSpan.textContent).toBe('1 error');
    });

    it('should display the correct wording for multiple validation errors', () => {
        const mockTemplateUploadResultForMultipleErrors = { propertyLimits:mockTemplateUploadResult.propertyLimits , validationResults: [...mockTemplateUploadResult.validationResults,...mockTemplateUploadResult.validationResults] };
        component.uploadResult = mockTemplateUploadResultForMultipleErrors;
        fixture.detectChanges();
        const errorResultsSpan: HTMLSpanElement | null = fixture.debugElement.nativeElement.querySelector('#error-results');
        expect(errorResultsSpan).not.toBeNull();
        expect(errorResultsSpan.textContent).toBe('2 errors');
    });
});
