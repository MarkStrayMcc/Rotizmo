import { Injectable } from "@angular/core";

import { Observable, Observer } from "rxjs";

import { FileData } from "@app/models";

@Injectable()
export class FileUploadService {
    public readFile(file: File): Observable<FileData> {
        return Observable.create((observer: Observer<FileData>) => {
            const reader = new FileReader();

            reader.onerror = err => observer.error(err);
            reader.onabort = err => observer.error(err);
            reader.onload = () => observer.next(this.getFileData(file.name, file.type, reader.result as string));

            reader.onloadend = () => observer.complete();

            return reader.readAsDataURL(file);
        });
    }

    private getFileData(fileName: string, fileType: string, data: string): FileData {
        const result = new FileData();

        result.name = fileName;
        result.data = data;
        // tslint:disable-next-line:no-bitwise
        result.extension = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
        result.type = fileType;

        return result;
    }
}
