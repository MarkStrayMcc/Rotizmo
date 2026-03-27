import { AbstractControl, ValidatorFn } from "@angular/forms";

export class PricingValidators {
   public static minimumPremium(minimumPremium: number): ValidatorFn {
       return (control: AbstractControl): { [key: string]: any } => {
           const invalidResult = {
               quotedBelowMinimumPremium: {
                   minValue: minimumPremium,
               },
           };

            let quotedValue = control.value;
           
            if (quotedValue && quotedValue >= minimumPremium) { 
                return null
            } else {
                return invalidResult;
            }
        };
    }
}
