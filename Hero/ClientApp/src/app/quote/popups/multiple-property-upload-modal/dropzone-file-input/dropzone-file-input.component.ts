import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { TemplateUploadResult } from '@app/models/template-upload-result';
import { Subject, throwError } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';
import { MultiplePropertyUploadHttpService } from '../multiple-property-upload.http-service';
import { QuoteService } from '@app/quote/services/quote.service';
import { ToastrService, ToastType } from '@app/shared/toastr/toastr.service';

@Component({
    selector: 'app-dropzone-file-input',
    templateUrl: './dropzone-file-input.component.html',
    styleUrls: ['./dropzone-file-input.component.scss']
})
export class DropzoneFileInputComponent implements OnDestroy {
    private xlsxFileType: string = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private ngUnsubscribe = new Subject<void>();

    errorMessage: string | null = null;
    hasError: boolean = false;
    fileName: string | null = null;
    isLoading = false;
    fileList: FileList | null = null;
    maxFileSize: number = 1048576;

    @Output() uploadResult = new EventEmitter<TemplateUploadResult>();
    @Output() fileNameChanged = new EventEmitter<string | null>();

    constructor(
        private _multiplePropertyUploadHttpService: MultiplePropertyUploadHttpService,
        private _quoteService: QuoteService,
        private _toastrService: ToastrService) { }


    public fileChange(event: any): void {
        this.fileList = event.target.files;
        this.uploadTemplate();
    }

    public onFileDropped(event: FileList): void {
        this.fileList = event;
        this.uploadTemplate();
    }

    public replaceFile(): void {
        this.fileList = null;
        this.fileName = null;
        this.hasError = false;
        this.errorMessage = null;
        this.fileNameChanged.emit(this.fileName);
        this.uploadResult.emit(null);
    }

    private uploadTemplate() {
        if (this.fileList?.length > 0) {

            const file = this.fileList[0];
            if (file.size > this.maxFileSize) {
                this.hasError = true;
                this.errorMessage = "File size of 1GB exceeded. Please upload a smaller file."
            }
            else if (file.type !== this.xlsxFileType) {
                this.hasError = true;
                this.errorMessage = "Invalid file type. Please upload an Excel file."
            } else {
                this.isLoading = true;
                this._multiplePropertyUploadHttpService
                    .upload(this.fileList[0], this._quoteService.getClient().id, this._quoteService.getWordingVersionId())
                    .pipe(
                        takeUntil(this.ngUnsubscribe),
                        tap((result: TemplateUploadResult) => {
                            this.fileName = this.fileList?.length > 0 ? this.fileList[0].name : null;
                            this.isLoading = false;
                            this.fileNameChanged.emit(this.fileName);
                            this.uploadResult.emit(result);
                        }),
                        catchError(() => {
                            this._toastrService.show('Upload operation failed!', ToastType.Error);
                            this.isLoading = false;
                            return throwError('Upload operation failed!');
                        })
                    )
                    .subscribe()

            }
        } else {
            this.hasError = true;
            this.errorMessage = "File error: missing fields";
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
