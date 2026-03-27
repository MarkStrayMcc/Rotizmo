import { RiskQuestion } from "@app/models";
import { Injectable } from "@angular/core";

@Injectable()
export class RiskQuestionValidationHandler {
    public getValidationMessages(errors: any): string {
        return Object.keys(errors).map(key => this.getErrorMessageFromKey(key , errors[key])).join("\r\n");
    }

    private getErrorMessageFromKey(key: string, error: any): string {
        switch (key) {
            case "required": return "Required";
            case "min": return `Percentage must be less than or equal to ${error.min}`;
            case "max": return `Percentage must be less than or equal to ${error.max}`;
            case "invalidGeoLocation": return `Unable to locate address`;
            default: return "UNKOWN ERROR";
        }
    }
}
