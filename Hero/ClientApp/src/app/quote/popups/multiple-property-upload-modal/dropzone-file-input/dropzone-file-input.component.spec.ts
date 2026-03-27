import { fakeAsync, flush, ComponentFixture, TestBed } from '@angular/core/testing';
import { DropzoneFileInputComponent } from './dropzone-file-input.component';
import { ToastrService, ToastType } from '@app/shared/toastr/toastr.service';
import { QuoteService } from '@app/quote/services/quote.service';
import { MultiplePropertyUploadHttpService } from '../multiple-property-upload.http-service';
import { Client, Quote } from '@app/models';
import { Observable, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateUploadResult } from '@app/models/template-upload-result';

const mockClientId = 1;
const mockWordingVersionId = 1;

class MockMultiplePropertyUploadHttpService {
    public upload(file: File, clientId: number, wordingVersionId: number): Observable<TemplateUploadResult> {
        return of({} as TemplateUploadResult);
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
        return { id: mockClientId } as Client;
    }

    public getWordingVersionId(): number {
        return mockWordingVersionId;
    }
}

describe('DropzoneFileInputComponent', () => {
    let component: DropzoneFileInputComponent;
    let fixture: ComponentFixture<DropzoneFileInputComponent>;
    let uploadService: MultiplePropertyUploadHttpService;
    let quoteService: QuoteService;
    let toasterService: ToastrService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DropzoneFileInputComponent],
            providers: [
                { provide: MultiplePropertyUploadHttpService, useClass: MockMultiplePropertyUploadHttpService },
                { provide: QuoteService, useClass: MockQuoteService },
                ToastrService
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DropzoneFileInputComponent);
        component = fixture.componentInstance;
        uploadService = TestBed.inject(MultiplePropertyUploadHttpService);
        quoteService = TestBed.inject(QuoteService);
        toasterService = TestBed.inject(ToastrService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should upload file with file selection", () => {
        spyOn(uploadService, 'upload').and.returnValue(of({} as any));
        
        const file = new File([""], "filename", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        component.fileChange({ target: { files: [file] } });
        
        expect(component.fileList.length).toBe(1);
        expect(uploadService.upload).toHaveBeenCalledWith(file, mockClientId, mockWordingVersionId);
    });

    it("should replace file", () => {
        spyOn(component.uploadResult, 'emit');
        component.replaceFile();
        expect(component.fileName).toBeNull();
        expect(component.hasError).toBeFalsy();
        expect(component.errorMessage).toBeNull();
        expect(component.uploadResult.emit).toHaveBeenCalledWith(null);
    });

    it("should show error message when file has different type from sheet", () => {
        const file = new File([""], "filename", { type: "docx" });
        component.fileChange({ target: { files: [file] } });
        expect(component.hasError).toBeTruthy();
        expect(component.errorMessage).toBe("Invalid file type. Please upload an Excel file.");
    });

    it("should emit the result on successful upload", () => {
        const mockResult: TemplateUploadResult = {
            propertyLimits: [],
            validationResults: [],
            templateValidationError: null
        };

        spyOn(uploadService, 'upload').and.returnValue(of(mockResult));
        const emitSpy = spyOn(component.uploadResult, 'emit');

        const file = new File([""], "filename.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        component.fileChange({ target: { files: [file] } });

        expect(emitSpy).toHaveBeenCalledWith(mockResult);
        expect(component.isLoading).toBeFalsy();
        expect(component.fileName).toBe("filename.xlsx");
    });

    it("should show toast error for non-400 errors", fakeAsync(() => {
        const errorResponse = new HttpErrorResponse({
            error: 'Server error',
            status: 500,
            statusText: 'Internal Server Error',
        });

        spyOn(uploadService, 'upload').and.returnValue(throwError(() => errorResponse));
        const toasterSpy = spyOn(toasterService, 'show');
        const emitSpy = spyOn(component.uploadResult, 'emit');

        const file = new File([""], "filename.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        try {
            component.fileChange({ target: { files: [file] } });
            flush();
        } catch (error) {
            // error is expected
        }

        expect(toasterSpy).toHaveBeenCalledWith('Upload operation failed!', ToastType.Error);
        expect(component.isLoading).toBeFalsy();
        expect(emitSpy).not.toHaveBeenCalled();
    }));
});
