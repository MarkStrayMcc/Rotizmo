export class ValidationResult {
    public errors: Error[];
    public isValid: boolean;
    public locationIdentifier: string;
    public validationAddress: string;
}

export class Error {
    public errorCode: string;
    public errorMessage: string
}
