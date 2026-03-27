import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AddTransactionModalFormInitialiser } from "./add-transaction-modal-form-initialiser";
import * as moment from "moment";
import { DateValidators } from "@app/validators/date.validators";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { AddTransactionFormValue } from "../models/AddTransactionFormValue";

/**
 * https://angular.io/guide/dependency-injection-providers#creating-tree-shakable-providers
//  */
// @Injectable({
//     providedIn: "root",
//     useFactory: (fb: FormBuilder, oFundFormInitialValueRetriever: OutstandingFundFormInitialValueRetriever) =>
//         new AddTransactionOutstandingFundsModalFormInitialiserService(fb, oFundFormInitialValueRetriever),
//     deps: [FormBuilder, OutstandingFundFormInitialValueRetriever]
// })
export class AddTransactionOutstandingFundsModalFormInitialiserService extends AddTransactionModalFormInitialiser {

    constructor(private readonly fb: FormBuilder) {
        super();
    }

    public initialiseForm(intialFormValues: AddTransactionFormValue): FormGroup {
        const areElementsDisabled = true;
        const formGroup: FormGroup = this.fb.group({
            cfcBankAccountId: [{ value: intialFormValues.cfcBankAccountId, disabled: areElementsDisabled }, [Validators.required]],
            paidDate: [moment(), [Validators.required, DateValidators.date()]],
            transactionType: [{ value: intialFormValues.transactionType, disabled: areElementsDisabled }, [Validators.required]],
            financialLedgerId: [{ value: intialFormValues.financialLedgerId, disabled: areElementsDisabled }, [Validators.required, AutocompleteSelectedValidator]],
            bankAccountCurrencyId: [{ value: intialFormValues.bankAccountCurrencyId, disabled: areElementsDisabled }, [Validators.required]],
            totalAccountAmount: [{ value: intialFormValues.totalAccountAmount, disabled: areElementsDisabled }, [Validators.required]],
            entryType: [{ value: intialFormValues.entryType, disabled: true }],
            originalAmountCurrencyId: [null, [Validators.required, AutocompleteSelectedValidator]],
            originalAmount: [null, [Validators.required]],
            bankAccountAmount: [null, [Validators.required]],
            binderDescription: [{ value: intialFormValues.binderDescription, disabled: areElementsDisabled }],
            binderYear: [{ value: intialFormValues.binderYear, disabled: areElementsDisabled }],
            sectionShortCode: [{ value: intialFormValues.sectionShortCode, disabled: areElementsDisabled }, [Validators.pattern("^[a-zA-Z0-9_]*$")]],
            lloydsRiskCode: [{ value: intialFormValues.lloydsRiskCode, disabled: areElementsDisabled }, [Validators.pattern("^([a-zA-Z0-9_]{2})?$")]],
            transactionReference: [{ value: intialFormValues.transactionReference, disabled: areElementsDisabled }, [Validators.required]],
            tags: [{ value: intialFormValues.tags, disabled: areElementsDisabled }],
            tpaFee: [{ value: intialFormValues.tpaFee, disabled: areElementsDisabled }],
            carrier: [intialFormValues.carrier, Validators.required],
            notes: [intialFormValues.notes],
            carrierParticipationPercentage: [{ value: intialFormValues.carrierParticipationPercentage, disabled: areElementsDisabled }]
        });
        return formGroup;
    }
}
