import { Injectable } from "@angular/core";
import { inject, TestBed } from "@angular/core/testing";
import { ClientClearanceHttpService } from './client-clearance-http.service';
import { MessageService } from "@app/services/message.service";
import { ClientClearanceService } from "@app/services/client-clearance-service";
import { MessageCategory } from "@app/enums/MessageCategory";
import { Message } from "@app/models/Message";
import { ClientClearanceRequest } from "@app/models/auto-generated/ClientClearanceRequest";
import { ClientClearanceResult } from "@app/models/auto-generated/ClientClearanceResult";
import { Observable, from, throwError } from 'rxjs';
import { MessageType } from "@app/enums/MessageType";
import { UserService } from "@app/services/user.service";

let clientClearanceResult: ClientClearanceResult;

describe("ClientClearanceService", () => {
    let clientClearanceService: ClientClearanceService;
    let clientClearanceHttpService: ClientClearanceHttpService;
    let messageService: MessageService;

    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            ClientClearanceService,
            { provide: ClientClearanceHttpService, useClass: MockClientClearanceHttpService },
            { provide: MessageService, useClass: MockMessageService },
            { provide: UserService, useClass: MockUserService }
        ]
    }));

    beforeEach(inject([ClientClearanceService, ClientClearanceHttpService, MessageService], (ccs, cchs, ms) => {
        clientClearanceService = ccs;
        clientClearanceHttpService = cchs;
        messageService = ms;
    }));

    beforeEach(() => {
        spyOn(messageService, "sendMessage").and.callThrough();
        spyOn(messageService, "clearMessage").and.callThrough();
    });

    describe("checkClientClearanceForBroker", () => {
        it("Should call clear message when client clearance returns true for broker", () => {
            // Arrange
            spyOn(clientClearanceHttpService, "checkClientClearanceForBroker").and.callThrough();
            clientClearanceResult = positiveClientClearanceResult();

            // Act
            clientClearanceService.checkClientClearanceForBroker(1, "");

            // Assert
            expect(messageService.clearMessage).toHaveBeenCalled();
        });

        it("Should call send message when client clearance returns false for broker", () => {
            // Arrange
            spyOn(clientClearanceHttpService, "checkClientClearanceForBroker").and.callThrough();
            clientClearanceResult = negativeClientClearanceResult();
           
            // Act
            clientClearanceService.checkClientClearanceForBroker(1, "");

            // Assert
            expect(messageService.sendMessage).toHaveBeenCalled();
            
            expect(messageService.sendMessage).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    text: "This client is already held by another broker. Please check before issuing quotes."
                }),
                MessageCategory.ClientClearance
            );
        });

        it("Should call send message when client clearance returns error", () => {
            // Arrange
            spyOn(clientClearanceHttpService, "checkClientClearanceForBroker").and.returnValue(throwError({ status: 400 }));

            // Act
            clientClearanceService.checkClientClearanceForBroker(1, "");

            // Assert
            expect(messageService.sendMessage).toHaveBeenCalled();

            expect(messageService.sendMessage).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    text: "An error occurred while performing the client clearance check. Please check manually before issuing quotes."
                }),
                MessageCategory.ClientClearance
            );
        });
    });

    function positiveClientClearanceResult(): ClientClearanceResult {
        let clientClearanceResult = new ClientClearanceResult();
        clientClearanceResult.isClientClearedForBroker = true;
        return clientClearanceResult;
    }

    function negativeClientClearanceResult(): ClientClearanceResult {
        let clientClearanceResult = new ClientClearanceResult();
        clientClearanceResult.isClientClearedForBroker = false;
        return clientClearanceResult;
    }
});

@Injectable()
class MockClientClearanceHttpService {
    public checkClientClearanceForBroker(clientClearanceRequest: ClientClearanceRequest):
        Observable<ClientClearanceResult> {
        return from([
            clientClearanceResult
        ]);
    }
}

@Injectable()
class MockMessageService {
    public clearMessage(messageCategory: MessageCategory) { };
    public sendMessage(message: Message, messageCategory: MessageCategory) { };
}

@Injectable()
class MockUserService {
    public isFeatureAccessible(feature: string) { return true; };
}
