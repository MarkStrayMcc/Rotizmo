import { TestBed, inject, ComponentFixture, async, fakeAsync, tick } from "@angular/core/testing";
import { Message, MessageType } from "@app/models";
import { ErrorMessageHandlerService } from "@app/services/error-message-handler.service";
import { MessageService } from "@app/services/message.service";

class mockMessageService {
    public sendMessage(message: Message) { }
};

/**
 * Tests for ErrorMessageHandlerService.
 */
describe("ErrorMessageHandlerService",
    () => {
        let errorMessageService: ErrorMessageHandlerService;
        let messageService: mockMessageService;

        beforeEach(() => {
            let tester = TestBed.configureTestingModule({
                providers: [
                    ErrorMessageHandlerService,
                    { provide: MessageService, useClass: mockMessageService }
                ]
            });

            errorMessageService = tester.get(ErrorMessageHandlerService);
            messageService = tester.get(MessageService);
        });

        it("calls message service with warning level for status 422 errors",
            fakeAsync(() => {
                // Assemble
                let expectedMessage = new Message("test", MessageType.Warning);
                let messageSpy = spyOn(messageService, "sendMessage");

                // Act
                errorMessageService.handleErrorsByStatusCode("test", 422);
                tick(1);

                expect(messageSpy).toHaveBeenCalledWith(expectedMessage);
            }));

        it("calls message service with error level by default",
            fakeAsync(() => {
                // Assemble
                let expectedMessage = new Message("test", MessageType.Error);
                let messageSpy = spyOn(messageService, "sendMessage");

                // Act
                errorMessageService.handleError("test");
                tick(1);
                expect(messageSpy).toHaveBeenCalledWith(expectedMessage);
            }));

        it("calls message service with info level for status 200",
            fakeAsync(() => {
                // Assemble
                let expectedMessage = new Message("test", MessageType.Info);
                let messageSpy = spyOn(messageService, "sendMessage");

                // Act
                errorMessageService.handleErrorsByStatusCode("test", 200);
                tick(1);
                expect(messageSpy).toHaveBeenCalledWith(expectedMessage);
            }));
    });
