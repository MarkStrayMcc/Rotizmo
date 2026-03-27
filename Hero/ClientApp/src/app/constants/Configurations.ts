export class Configurations {
    public static Email = {
        MaxFileCount: 10,
        MaxFileSize: 20971520,
        ValidFileTypes: ".pdf, .doc, .docx",
        MaxContentSize: 20971520
    };

    public static BulkUploadFile = {
        MaxFileCount: 1,
        MaxFileSize: 20971520,
        ValidFileTypes: ".xlsx",
        MaxContentSize: 20971520
    }
}
