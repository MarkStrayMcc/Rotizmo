import { FormGroup } from "@angular/forms";
import { AddTransactionFormValue } from "../models/AddTransactionFormValue";

// @Injectable({
//     providedIn: "root"
// })
export abstract class AddTransactionModalFormInitialiser {
/**
 *
 * if (outstandingFund is not null) {
 *      the form is prepopulated with outstanding fund record fields
 *      not all dropdown data sources are populated
 *      and some form controls are disabled
 *          fetch contributions from coreapi
 *          display all carrier contributions so far
 * } else (outstandingFund is null) {
 *     form behaves the way it behaves today
 *     populate all dropdown data
 * }
 *
 * coreapiwebapi/api/outstanding-funds/{id}/carrier-contributions
 */
    public abstract initialiseForm(intialFormValues: AddTransactionFormValue): FormGroup;
}
