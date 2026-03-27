import { EmailTemplate } from "@app/models";
import { BehaviorSubject, Subject } from "rxjs";
import { FormItem } from "../form-creator/form-creator.config";
import { Injectable } from "@angular/core";

@Injectable()
export class FormCreatorService {
    private _form: BehaviorSubject<FormItem> = new BehaviorSubject<FormItem>(null);
    public formInstance = this._form.asObservable();

    private _button: Subject<string> = new Subject<string>();
    public buttonClicked = this._button.asObservable();

    private _emailTemplate: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    public emailTemplateChanged = this._emailTemplate.asObservable();

    private _contacts: BehaviorSubject<any> = new BehaviorSubject<Array<any>>([]);
    public contactsChanged = this._contacts.asObservable();

    public setForm(newFormItem: FormItem) {
        this._form.next(newFormItem);
        return this._form;
    }

    public setButtonClicked(button) {
        this._button.next(button);
        return this._button;
    }

    public setEmailTemplate(template: EmailTemplate) {
        this._emailTemplate.next(template);
    }

    public setContacts(template: EmailTemplate) {
        this._contacts.next(template);
    }
}
