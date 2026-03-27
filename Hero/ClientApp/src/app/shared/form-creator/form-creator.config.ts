import { AsyncValidatorFn, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { EmailType } from "@app/enums";
import { Guid } from "guid-typescript";
import * as moment from "moment";
import { Observable } from 'rxjs';
import { ICurrency } from "./ICurrency";

export class Field {
  public constructor(init?: Partial<Field>) {
    Object.assign(this, init);
  }
  label: string;
  property?: string;
  value?: Function | any;
  cssClass?: string;

  isField() {
    return this instanceof (Field);
  }

  isTextBox() {
    return this instanceof (TextBoxField);
  }

  isCheckBox() {
    return this instanceof (CheckBoxField)
  }

  isQuestion() {
    return this instanceof (QuestionField)
  }

  isInteger() {
    return this instanceof (IntegerField);
  }

  isCurrency() {
    return this instanceof (CurrencyField);
  }

  isDate() {
    return this instanceof (DateField);
  }

  isContact() {
    return this instanceof (ContactField)
  }

  isDropDown() {
    return this instanceof (DropDownField)
  }

  isReadOnly() {
    return this instanceof (ReadOnlyField)
  }

  isSubject() {
    return this instanceof (SubjectField)
  }

  isAttachment() {
    return this instanceof (AttachmentField)
  }

  isTextArea() {
    return this instanceof (TextAreaField);
  }

  public getFinalValue(value) {
    return value;
  }
}

export class FormButton {
  public constructor(init?: Partial<FormButton>) {
    Object.assign(this, init);
  }
  label: string;
  property?: string;
  cssClass?: string;
  style?: string = "primary";
  type: FormButtonTypes;
  disable?: boolean;
  isExecuting?: boolean = false;
}

export enum FormButtonTypes {
  Submit = "submit",
  Button = "button"
}

export class FormField extends Field {
  public constructor(init?: Partial<FormField>) {
    super(init);
    Object.assign(this, init);
  }
  allowedRoles?: any = [];
  placeholder?: string;
  isDisabled?: boolean = false;
  validators?: FieldValidator[];
  isVisible?: boolean = true;
  hasSeparator?: boolean = false;
}

export class TextBoxField extends FormField {
  public constructor(init?: Partial<TextBoxField>) {
    super(init);
    Object.assign(this, init);
  }
}

export class AttachmentField extends FormField {
  public constructor(init?: Partial<AttachmentField>) {
    super(init);
    Object.assign(this, init);
  }
  serverSideField: string;
  mtaId?: Guid;
  policyNumber?: string;
}

export class ContactField extends FormField {
  public constructor(init?: Partial<ContactField>) {
    super(init);
    Object.assign(this, init);
  }
  brokerName: string;
  emailType: EmailType;
  policyNumber?: string;
  mtaId?: Guid;
  templateProperty?: string;
}

export class SubjectField extends FormField {
  public constructor(init?: Partial<SubjectField>) {
    super(init);
    Object.assign(this, init);
  }
  brokerName?: string;
  emailType?: EmailType;
  policyNumber?: string;
  mtaId?: Guid;
  templateProperty?: string;
}

export class CheckBoxField extends FormField { }

export class QuestionField extends FormField { }

export class FileInputField extends FormField { }

export class DropDownField extends FormField {
  public constructor(init?: Partial<DropDownField>) {
    super(init);
    Object.assign(this, init);
  }
  enum?: any;
  requestData?: Observable<any>;
  serverFiltering: boolean;
}

export class ReadOnlyField extends FormField {
  public constructor(init?: Partial<ReadOnlyField>) {
    super(init);
    Object.assign(this, init);
  }
  isMoment?: boolean;
}

export class IntegerField extends TextBoxField {
  public constructor(init?: Partial<IntegerField>) {
    super(init);
    Object.assign(this, init);
  }
}

export class CurrencyField extends FormField {
  public constructor(init?: Partial<CurrencyField>) {
    super(init);
    Object.assign(this, init);
  }
  currency?: Observable<ICurrency>;
}

export class DateField extends FormField {

  public constructor(init?: Partial<DateField>) {
    super(init);
    Object.assign(this, init);
  }

  getFinalValue(value: any) {
    return moment(value, "DD/MM/YYYY");
  }

  private pad(finalSize: number, value: string, char: string = "0") {
    return (finalSize <= value.length) ? value : this.pad(finalSize, char + value, char);
  }
}

export class TextAreaField extends FormField {
  public constructor(init?: Partial<TextAreaField>) {
    super(init);
    Object.assign(this, init);
  }
  rows?: number;
  cols?: number;
}

export class FormGrouper {
  title: string;
  fields: Field[];
  hasSeparatorLine?: boolean;
}

export enum FormType {
  General,
  SendEmail
}

export class FormConfig {
  public constructor(init?: Partial<FormConfig>) {
    Object.assign(this, init);
  }

  title?: string;
  selector: string;
  fields: FormField[];
  groups?: FormGrouper[] = [];
  buttons?: FormButton[];
  type?: FormType;
  template?: TemplateType;


  static getAllFields(formConfig: FormConfig) {
    if (!formConfig.groups) {
      return formConfig.fields;
    }

    const groupsFields = formConfig.groups.reduce<Field[]>((total, g) => total.concat(g.fields), []);
    const allFields = formConfig.fields.concat(groupsFields);
    return allFields;
  }
}

export class SendEmailFormConfig extends FormConfig {
  policyNumber?: string;
  mtaId?: Guid;
  brokerName?: string;
}

export class FormItem {
  selector: string;
  form: FormGroup;
  buttons: FormButton[];
}

export enum TemplateType {
  OneColumn,
  TwoColumns
}

export class EditInfo extends FormConfig { }

export class CreateInfo extends FormConfig { }

export class RemoveInfo extends FormConfig { }

export class FieldValidator {
  public constructor(init?: Partial<FieldValidator>) {
    Object.assign(this, init);
  }
  selector: string;
  message?: string;
  validator: ValidatorFn;
  asyncValidator?: AsyncValidatorFn;
}
