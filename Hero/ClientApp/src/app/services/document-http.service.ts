import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseService } from "./base.service";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";

@Injectable()
export class DocumentHttpService extends BaseService {

    constructor(http: HttpClient) {
        super(http);
    }

    public getWordingFile(wordingVersionId: number, countryId: number, format: string): Observable<File> {
        const url = `/document/${format}/${countryId}/wording/${wordingVersionId}`;
        return this.http.get(url)
            .pipe(
            map((r: any) => this.toFile(r)));
    }

    public getQuoteFile(quoteId: number, format: string): Observable<File> {
        const url = `/document/${format}/quote/${quoteId}`;
        return this.http.get(url)
            .pipe(
            map((r: any) => this.toFile(r)));
    }

    private toFile(r: any): File {
        const contentDisposition = r.headers.get("Content-Disposition");
        const parts: string[] = contentDisposition.split(';');
        let fileName: string = parts[1].split('=')[1];
        fileName = fileName.substr(1, fileName.length - 2);
        var file = new File([r._body], fileName);
        return file;
    }

}