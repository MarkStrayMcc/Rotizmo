
// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute

import * as Models from "@app/models/auto-generated";
export class SendEuDocumentsRequest {  
    public to: Models.EmailContact[];
    public cc: Models.EmailContact[];
    public bcc: Models.EmailContact[];
    public subject: string;
    public emailBody: string;
    public sender: Models.EmailContact;
    public mergeFields: { [key: string]: string; };
    public dataAttachments: Models.FileData[];
    public serverSideAttachments: Models.ServerSideFileData[];
    public emailType: Models.EmailType;
    public clientUid: string; 
}
