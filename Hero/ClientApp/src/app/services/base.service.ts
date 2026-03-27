import { RequestOptions, Response } from "@angular/http";
import { throwError } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

export class BaseService {

    constructor(protected http: HttpClient) {

    }

    protected commonHttpHeaders(token: string) {
        const headers = new HttpHeaders();
        if (token) {
            headers.append("Authorization", token);
        }
        headers.append("Content-Type", "application/json; charset=utf-8");
        return { headers };
    }

    // If the body is null or undefined (doing a "juggling-check"), return empty object.
    protected extractData(res: Response) {
        const body = res.json();
        return body == null ? null : body;
    }

    protected handleErrorObservable(response: Response | any) {
        console.error(response);
        return throwError(response);
    }

    protected handleErrorPromise(response: Response | any) {
        console.error(response);
        return Promise.reject(response);
    }
}
