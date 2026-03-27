import { Observable } from "rxjs";

export interface ILookup<T> {
    getData(): Observable<T>;
}