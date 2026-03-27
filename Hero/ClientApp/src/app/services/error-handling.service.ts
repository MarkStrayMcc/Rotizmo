import { ErrorHandler, Injectable } from "@angular/core";
import { LoggingService } from "./logging.service";

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
    constructor(private readonly loggingService: LoggingService) {
        super();
    }

    handleError = (error: Error): void => {
        this.loggingService.logException(error);
    }
}
