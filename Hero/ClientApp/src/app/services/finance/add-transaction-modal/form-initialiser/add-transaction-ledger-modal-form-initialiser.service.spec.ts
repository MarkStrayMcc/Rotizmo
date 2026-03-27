import { TestBed } from "@angular/core/testing";
import { AddTransactionLedgerModalFormInitialiserService } from "./add-transaction-ledger-modal-form-initialiser.service";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";

// describe("AddTransactionLedgerModalFormInitialiserService", () => {
//     let service: AddTransactionLedgerModalFormInitialiserService;
//     let formGroup: FormGroup;
//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [
//                 ReactiveFormsModule
//             ],
//             providers: [
//                 FormBuilder,
//                 AddTransactionLedgerModalFormInitialiserService
//             ]
//         });
//         service = TestBed.inject(AddTransactionLedgerModalFormInitialiserService);
//         expect(service).toBeTruthy();
//         formGroup = service.initialiseForm();
//     });

//     it("should return a FormGroup", () => {
//         expect(formGroup).toBeDefined();
//         expect(formGroup instanceof FormGroup).toBeTruthy();
//     });

//     it("should return FormGroup controls with certain elements disabled", () => {
//         expect(formGroup.get("cfcBankAccountId")).toBeDefined();
//         expect(formGroup.get("cfcBankAccountId").disabled).toBeFalsy();

//         expect(formGroup.get("paidDate")).toBeDefined();
//         expect(formGroup.get("paidDate").disabled).toBeFalsy();

//         expect(formGroup.get("transactionType")).toBeDefined();
//         expect(formGroup.get("transactionType").disabled).toBeFalsy();

//         expect(formGroup.get("financialLedgerId")).toBeDefined();
//         expect(formGroup.get("financialLedgerId").disabled).toBeFalsy();

//         expect(formGroup.get("bankAccountCurrencyId")).toBeDefined();
//         expect(formGroup.get("bankAccountCurrencyId").disabled).toBeTruthy();

//         expect(formGroup.get("totalAccountAmount")).toBeDefined();
//         expect(formGroup.get("totalAccountAmount").disabled).toBeFalsy();

//         expect(formGroup.get("entryType")).toBeDefined();
//         expect(formGroup.get("entryType").disabled).toBeTruthy();

//         expect(formGroup.get("originalAmountCurrencyId")).toBeDefined();
//         expect(formGroup.get("originalAmountCurrencyId").disabled).toBeFalsy();

//         expect(formGroup.get("originalAmount")).toBeDefined();
//         expect(formGroup.get("originalAmount").disabled).toBeFalsy();

//         expect(formGroup.get("bankAccountAmount")).toBeDefined();
//         expect(formGroup.get("bankAccountAmount").disabled).toBeFalsy();

//         expect(formGroup.get("binderDescription")).toBeDefined();
//         expect(formGroup.get("binderDescription").disabled).toBeTruthy();

//         expect(formGroup.get("binderYear")).toBeDefined();
//         expect(formGroup.get("binderYear").disabled).toBeTruthy();

//         expect(formGroup.get("sectionShortCode")).toBeDefined();
//         expect(formGroup.get("sectionShortCode").disabled).toBeTruthy();

//         expect(formGroup.get("lloydsRiskCode")).toBeDefined();
//         expect(formGroup.get("lloydsRiskCode").disabled).toBeTruthy();

//         expect(formGroup.get("transactionReference")).toBeDefined();
//         expect(formGroup.get("transactionReference").disabled).toBeFalsy();

//         expect(formGroup.get("carrier")).toBeDefined();
//         expect(formGroup.get("carrier").disabled).toBeFalsy();

//         expect(formGroup.get("notes")).toBeDefined();
//         expect(formGroup.get("notes").disabled).toBeFalsy();

//         expect(formGroup.get("carrierParticipationPercentage")).toBeDefined();
//         expect(formGroup.get("carrierParticipationPercentage").disabled).toBeTruthy();
//     });
// });
