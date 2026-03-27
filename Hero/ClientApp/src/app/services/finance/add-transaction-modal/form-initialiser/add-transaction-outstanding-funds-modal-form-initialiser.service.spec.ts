import { TestBed } from "@angular/core/testing";
import { AddTransactionOutstandingFundsModalFormInitialiserService } from "./add-transaction-outstanding-funds-modal-form-initialiser.service";
import { FormGroup, ReactiveFormsModule, FormBuilder } from "@angular/forms";

// describe("AddTransactionOutstandingFundsModalFormInitialiserService", () => {
//     let service: AddTransactionOutstandingFundsModalFormInitialiserService;
//     let formGroup: FormGroup;
//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [
//                 ReactiveFormsModule
//             ],
//             providers: [
//                 FormBuilder,
//                 AddTransactionOutstandingFundsModalFormInitialiserService
//             ]
//         });
//         service = TestBed.inject(AddTransactionOutstandingFundsModalFormInitialiserService);
//         expect(service).toBeTruthy();
//         formGroup = service.initialiseForm();
//     });

//     it("should return a FormGroup", () => {
//         expect(formGroup).toBeDefined();
//         expect(formGroup instanceof FormGroup).toBeTruthy();
//     });

//     it("should return FormGroup controls with certain elements disabled", () => {
//         expect(formGroup.get("cfcBankAccountId")).toBeDefined();
//         expect(formGroup.get("cfcBankAccountId").disabled).toBeTruthy();

//         expect(formGroup.get("paidDate")).toBeDefined();
//         expect(formGroup.get("paidDate").disabled).toBeFalsy();

//         expect(formGroup.get("transactionType")).toBeDefined();
//         expect(formGroup.get("transactionType").disabled).toBeTruthy();

//         expect(formGroup.get("financialLedgerId")).toBeDefined();
//         expect(formGroup.get("financialLedgerId").disabled).toBeTruthy();

//         expect(formGroup.get("bankAccountCurrencyId")).toBeDefined();
//         expect(formGroup.get("bankAccountCurrencyId").disabled).toBeTruthy();

//         expect(formGroup.get("totalAccountAmount")).toBeDefined();
//         expect(formGroup.get("totalAccountAmount").disabled).toBeTruthy();

//         expect(formGroup.get("entryType")).toBeDefined();
//         expect(formGroup.get("entryType").disabled).toBeTruthy();

//         expect(formGroup.get("originalAmountCurrencyId")).toBeDefined();
//         expect(formGroup.get("originalAmountCurrencyId").disabled).toBeTruthy();

//         expect(formGroup.get("originalAmount")).toBeDefined();
//         expect(formGroup.get("originalAmount").disabled).toBeTruthy();

//         expect(formGroup.get("bankAccountAmount")).toBeDefined();
//         expect(formGroup.get("bankAccountAmount").disabled).toBeTruthy();

//         expect(formGroup.get("binderDescription")).toBeDefined();
//         expect(formGroup.get("binderDescription").disabled).toBeTruthy();

//         expect(formGroup.get("binderYear")).toBeDefined();
//         expect(formGroup.get("binderYear").disabled).toBeTruthy();

//         expect(formGroup.get("sectionShortCode")).toBeDefined();
//         expect(formGroup.get("sectionShortCode").disabled).toBeTruthy();

//         expect(formGroup.get("lloydsRiskCode")).toBeDefined();
//         expect(formGroup.get("lloydsRiskCode").disabled).toBeTruthy();

//         expect(formGroup.get("transactionReference")).toBeDefined();
//         expect(formGroup.get("transactionReference").disabled).toBeTruthy();

//         expect(formGroup.get("carrier")).toBeDefined();
//         expect(formGroup.get("carrier").disabled).toBeTruthy();

//         expect(formGroup.get("notes")).toBeDefined();
//         expect(formGroup.get("notes").disabled).toBeTruthy();

//         expect(formGroup.get("carrierParticipationPercentage")).toBeDefined();
//         expect(formGroup.get("carrierParticipationPercentage").disabled).toBeTruthy();
//     });
// });
