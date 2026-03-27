import { ErrorHandler, Injectable } from "@angular/core";
import { Message } from "@app/models";
import { MessageService } from "@app/services/message.service";
import { MessageType } from "@app/enums/MessageType";
import { WarningComponent } from "@app/components/warning/warning.component";

@Injectable()
export class ErrorMessageHandlerService implements ErrorHandler {

    constructor(private messageService: MessageService) {

    }

    public handleError(error): void {
        let statusCode = 500;
        if (error && error.status) {
            statusCode = error.status;
        }
        this.handleErrorsByStatusCode(error, statusCode);
    }

    public handleWarning(warning): void {
        let statusCode = 422;
        if (warning && warning.status) {
            statusCode = warning.status;
        }
        this.handleErrorsByStatusCode(warning, statusCode);
    }

    public handleErrorsByStatusCode(error, statusCode: number = 500): void {
        const msg = this.getErrorMessage(error);
        let errorCategory = MessageType.Error;
        switch (statusCode) {
            case 422:
                errorCategory = MessageType.Warning;
                break;
            case 200:
                errorCategory = MessageType.Info;
                break;
            case 500:
            default:
                errorCategory = MessageType.Error;
                break;
        }
        setTimeout(() => {
            this.messageService.sendMessage(new Message(msg, errorCategory));
        }, 0);
    }

    private getErrorMessage(error): string {
        let msg;
        if (error && error.message) {
            msg = error.message;
        }
        else {
            msg = error instanceof Error ? error.message : error.toString();
        }

        return msg;
    }
}
