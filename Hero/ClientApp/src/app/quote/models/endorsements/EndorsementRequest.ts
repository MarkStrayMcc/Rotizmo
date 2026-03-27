import { FileFormat } from "@app/enums";
export class EndorsementRequest {  
    public documentId: number;
    public documentVersionId: number;
    public wordDocumentTemplateId: number;
    public isDraft: boolean;
    public fileFormat: FileFormat;
    public mergeFields: { [key: string]: string; };
    public imageFields: { [key: string]: number[]; };
    public bookmarksToReplace: { [key: string]: string; }; 
}
