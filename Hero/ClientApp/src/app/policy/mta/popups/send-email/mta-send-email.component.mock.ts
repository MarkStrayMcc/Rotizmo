import { Policy } from "@app/models";
import { Guid } from "guid-typescript";
import { MtaSendEmailModel } from "./mta-send-email.model";

export const mockSendEmailRequest = {
    cfcUserId: "1dc86388-2e78-4caf-ab73-be46d9ae6749",
    policyNumber: "ESI0318041410",
    changeType: "PolicyReissue",
    effectiveDate: "2020-06-08T09:57:36.242Z",
    clientName: "Rodrigo Fante test",
};

export const mockEmailHttpService = {
    sendEmail: jasmine.createSpy(),
    getEmailTemplateForMta: jasmine.createSpy()
};

export const mockEuDocumentsHttpService = {
    sendEuDocuments: jasmine.createSpy(),
    getClient: jasmine.createSpy()
};

export const mockFileUploadService = {
    readFile: jasmine.createSpy()
};

export const mockMtaModalModel: MtaSendEmailModel = {
    mtaId: Guid.create(),
    policy: new Policy()
};
