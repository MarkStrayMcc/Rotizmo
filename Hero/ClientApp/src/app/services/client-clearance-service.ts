import { Injectable } from '@angular/core';
import { ClientClearanceHttpService } from "@app/services/client-clearance-http.service";
import { ClientClearanceRequest } from "@app/models/auto-generated/ClientClearanceRequest";
import { Message } from "@app/models/Message";
import { MessageType } from "@app/enums/MessageType";
import { MessageService } from "@app/services/message.service";
import { MessageCategory } from "@app/enums/MessageCategory";
import { UserService } from "@app/services/user.service";

@Injectable()
export class ClientClearanceService {
    constructor(
        private clientClearanceHttpService: ClientClearanceHttpService,
        private messageService: MessageService,
        private userService: UserService) {
    }

    public checkClientClearanceForBroker(brokerCompanyId: number,
        clientUid: string) {

        if (this.isClientClearanceFeatureAvailable()) {
            let clientClearanceRequest =
                this.buildClientClearanceRequest(brokerCompanyId, clientUid);

            this.clientClearanceHttpService.checkClientClearanceForBroker(clientClearanceRequest)
                .subscribe(
                    (data) => {
                        if (data && !data.isClientClearedForBroker) {
                            this.handleClientClearanceFailedResult("This client is already held by another broker. Please check before issuing quotes.");
                        } else {
                            this.messageService.clearMessage(MessageCategory.ClientClearance);
                        }
                    },
                    (error) => {
                        this.handleClientClearanceFailedResult("An error occurred while performing the client clearance check. Please check manually before issuing quotes.");
                        console.error(error);
                    }
                );
        }
    }

    private isClientClearanceFeatureAvailable() {
        return this.userService.isFeatureAccessible("heroClientClearance");
    }

    private buildClientClearanceRequest(brokerCompanyId: number,
        clientUid: string): ClientClearanceRequest {

        let clientClearanceRequest = new ClientClearanceRequest();

        clientClearanceRequest.brokerCompanyId = brokerCompanyId;
        clientClearanceRequest.clientId = clientUid;

        return clientClearanceRequest;
    }

    private handleClientClearanceFailedResult(errorMessage: string) {
        this.messageService.sendMessage(new Message(
                errorMessage,
                MessageType.Warning),
            MessageCategory.ClientClearance);
    }
}
