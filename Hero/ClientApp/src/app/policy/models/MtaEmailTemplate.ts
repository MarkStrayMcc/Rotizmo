import * as Models from "@app/models/auto-generated";

export class MtaEmailTemplate {  
    public subject: string;
    public body: string;
    public toContacts: Models.EmailContact[];
    public ccContacts: Models.EmailContact[];
    public bccContacts: Models.EmailContact[];
    public defaultAttachments: Models.ServerSideFileData[];
    public mergeFields: { [key: string]: string; };
    public emailType: string; 
}
