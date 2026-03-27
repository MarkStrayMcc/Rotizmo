import { AddTransactionModalFormInitialiser } from "./add-transaction-modal-form-initialiser";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as moment from "moment";
import { DateValidators } from "@app/validators/date.validators";
import { AutocompleteSelectedValidator } from "@app/validators/autocomplete-selected.validator";
import { AddTransactionFormValue } from "../models/AddTransactionFormValue";

// @Injectable({
//     providedIn: "root",
//     useFactory: (fb: FormBuilder, ledgerFormInitialValueRetriever: LedgerFormInitialValueRetriever) =>
//         new AddTransactionLedgerModalFormInitialiserService(fb, ledgerFormInitialValueRetriever),
//     deps: [FormBuilder, LedgerFormInitialValueRetriever]
// })
export class AddTransactionLedgerModalFormInitialiserService extends AddTransactionModalFormInitialiser {

    constructor(private readonly fb: FormBuilder) {
        super();
    }

    public initialiseForm(intialFormValues: AddTransactionFormValue): FormGroup {
        const areElementsDisabled = false;
        const formGroup: FormGroup = this.fb.group({
            cfcBankAccountId: [{ value: intialFormValues.cfcBankAccountId, disabled: areElementsDisabled }, [Validators.required]],
            paidDate: [moment(), [Validators.required, DateValidators.date()]],
            transactionType: [{ value: intialFormValues.transactionType, disabled: areElementsDisabled }, [Validators.required]],
            financialLedgerId: [{
                value: intialFormValues.financialLedgerId,
                disabled: areElementsDisabled
            }, [Validators.required, AutocompleteSelectedValidator]],
            bankAccountCurrencyId: [{ value: intialFormValues.bankAccountCurrencyId, disabled: true }, [Validators.required]],
            totalAccountAmount: [{ value: intialFormValues.totalAccountAmount, disabled: areElementsDisabled }, [Validators.required]],
            entryType: [{ value: intialFormValues.entryType, disabled: true }],
            originalAmountCurrencyId: [{
                value: null,
                disabled: areElementsDisabled
            }, [Validators.required, AutocompleteSelectedValidator]],
            originalAmount: [{ value: null, disabled: areElementsDisabled }, [Validators.required]],
            bankAccountAmount: [{ value: null, disabled: areElementsDisabled }, [Validators.required]],
            binderDescription: [{ value: intialFormValues.binderDescription, disabled: true }],
            binderYear: [{ value: intialFormValues.binderYear, disabled: true }],
            sectionShortCode: [{ value: intialFormValues.sectionShortCode, disabled: true }, [Validators.pattern("^[a-zA-Z0-9_]*$")]],
            lloydsRiskCode: [{ value: intialFormValues.lloydsRiskCode, disabled: true }, [Validators.pattern("^([a-zA-Z0-9_]{2})?$")]],
            transactionReference: [{ value: intialFormValues.transactionReference, disabled: areElementsDisabled }, [Validators.required]],
            tags: [intialFormValues.tags],
            tpaFee: [intialFormValues.tpaFee],
            carrier: [{ value: intialFormValues.carrier, disabled: areElementsDisabled }, Validators.required],
            notes: [{ value: intialFormValues.notes, disabled: areElementsDisabled }],
            carrierParticipationPercentage: [{ value: intialFormValues.carrierParticipationPercentage, disabled: true }]
        });
        return formGroup;
    }
}
