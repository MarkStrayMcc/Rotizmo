import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TemplateUploadResult } from '@app/models/template-upload-result';
import { BaseService } from "@app/services/base.service";
import { Observable, of, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class MultiplePropertyUploadHttpService extends BaseService {
	constructor(protected readonly http: HttpClient) {
		super(http);
	}

	public upload(file: File, clientId: number, wordingVersionId: number): Observable<TemplateUploadResult> {
		let formData: FormData = new FormData();
		formData.append("files", file, file.name);
		formData.append("clientId", clientId.toString());
		formData.append("wordingVersionId", wordingVersionId.toString());

		const headers = new HttpHeaders();
		headers.append("Content-Type", "multipart/form-data");
		headers.append("Accept", "application/json");

		const options = { headers: headers };

		return this.http.post<TemplateUploadResult>(`templates/upload`, formData, options).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 400) {
                    const errorMessage = typeof error.error === 'string' ? error.error : error.error?.templateValidationError;
                    const validationResult: TemplateUploadResult = {
                        propertyLimits: [],
                        validationResults: [],
                        templateValidationError: errorMessage
                    };
                    return of(validationResult);
                }

                return throwError(error);
            }),
            catchError(this.handleErrorObservable)
        );
	}
}
