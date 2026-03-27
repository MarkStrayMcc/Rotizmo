import { DialogTypes } from "./DialogTypes";

export class DialogParameters {
    public title: string;
    public message: string;
    public type: DialogTypes = DialogTypes.Warning;
    public positiveActionText: string;
    public dismissiveActionText: string;
}