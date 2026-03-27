import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()
export class DropDownFieldService {
    private _optionList: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public optionList = this._optionList.asObservable();

    public setOptionList(newList: any) {
        this._optionList.next(newList);
        return this._optionList;
    }
}
