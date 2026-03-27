import { HttpEvent, HttpEventType } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { async, TestBed } from "@angular/core/testing";
import { EmailContact } from "@app/models";
import { EmailContactService } from "@app/services/email-contact.service";

describe("EmailContactService", () => {
    let httpMock: HttpTestingController;
    let emailContactService: EmailContactService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [EmailContactService],
            imports: [HttpClientTestingModule]
        });
        emailContactService = TestBed.inject(EmailContactService);
        httpMock = TestBed.inject(HttpTestingController);
    }));

    it("should call getEmailContacts endpoint and the response should an email contact object list", () => {
        const emailContactMock = new EmailContact();
        emailContactMock.email = 'rfante@cfcunderwriting.com';
        emailContactMock.firstName = 'Rodrigo';
        emailContactMock.lastName = 'Silva';

        emailContactService.getEmailContacts().subscribe((responseEvent: HttpEvent<any>) => {
            switch (responseEvent.type) {
                case HttpEventType.Response:
                    expect(responseEvent.ok).toBeTruthy();
                    expect(responseEvent.body).toEqual(emailContactMock);
            }
        });

        const mockReq = httpMock.expectOne(`/email-contacts`);

        expect(mockReq.cancelled).toBeFalsy();
        expect(mockReq.request.responseType).toEqual('json');
        expect(mockReq.request.method).toBe("GET");
        mockReq.flush(emailContactMock);

        httpMock.verify();
    });
});
