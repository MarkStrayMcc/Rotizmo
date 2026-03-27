import { PropertyLimit } from '@app/quote/models/property-limit.model';
import { ValidationResult } from './validation-result';
import { PropertyLimitFloatingValues } from '@app/quote/models/property-limit-floating-values.model';

export class TemplateUploadResult {
    public propertyLimits: PropertyLimit[];
    public validationResults: ValidationResult[];
    public propertyLimitFloatingValues?:PropertyLimitFloatingValues;
    public firstLossLimitValue?: number;
    public templateValidationError?: string;
}
