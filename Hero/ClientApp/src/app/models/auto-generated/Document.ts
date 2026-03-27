
// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute

import * as Models from "@app/models/auto-generated";
export class Document {  
    public documentId: number;
    public documentVersionId: number;
    public documentTypeId: number;
    public reference: string;
    public title: string;
    public description: string;
    public riskQuestionTags: string[];
    public lockedOn: Date;
    public lockedBy: number;
    public createdOn: Date;
    public createdBy: number;
    public deletedOn: Date;
    public deletedBy: number;
    public isMandatory: boolean;
    public scopeId: Models.DocumentScope; 
}
