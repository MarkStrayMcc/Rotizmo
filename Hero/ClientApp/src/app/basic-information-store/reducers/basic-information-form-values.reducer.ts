import { createReducer, on } from '@ngrx/store';
import { BasicInformationFormValues } from '@app/basic-information-store/basic-information.state';
import * as actions from '@app/basic-information-store/actions';

export const intialFormValuesState: BasicInformationFormValues = {
  quoteState: null,
  client: null,
  brokerTeam: null,
  brokerContact: null,
  quoteType: "",
  surplusLinesBroker: null,
  insuranceType: 0,
  product: null,
  inceptionDate: null,
  policyPeriod: 0,
  language: 0,
  wordingVersionId: 0,
  localBroker: null,
  expiryDate: null,
  expiringPolicyNumber: "",
  hasEuSubsidiaries: false,
  assignedContact: null,
  currency: null,
  address: null,
};

export const basicInformationFormValuesReducer = createReducer(
  intialFormValuesState,
  on(
    actions.basicInformationLoad,
    (state: BasicInformationFormValues, { stateToLoad }) => ({
      ...state,
      quoteState: stateToLoad.formValues.quoteState,
      client: stateToLoad.formValues.client,
      brokerTeam: stateToLoad.formValues.brokerTeam,
      brokerContact: stateToLoad.formValues.brokerContact,
      quoteType: stateToLoad.formValues.quoteType,
      surplusLinesBroker: stateToLoad.formValues.surplusLinesBroker,
      insuranceType: stateToLoad.formValues.insuranceType,
      product: stateToLoad.formValues.product,
      inceptionDate: stateToLoad.formValues.inceptionDate,
      policyPeriod: stateToLoad.formValues.policyPeriod,
      language: stateToLoad.formValues.language,
      wordingVersionId: stateToLoad.formValues.wordingVersionId,
      localBroker: stateToLoad.formValues.localBroker,
      expiryDate: stateToLoad.formValues.expiryDate,
      expiringPolicyNumber: stateToLoad.formValues.expiringPolicyNumber,
      hasEuSubsidiaries: stateToLoad.formValues.hasEuSubsidiaries,
      assignedContact: stateToLoad.formValues.assignedContact,
      currency: stateToLoad.formValues.currency,
      address: stateToLoad.formValues.address,
    })
  ),
  on(
    actions.quoteStateChange,
    (state: BasicInformationFormValues, { quoteState }) => ({
      ...state,
      quoteState
    })
  ),
  on(
    actions.brokerTeamChange,
    (state: BasicInformationFormValues, { brokerTeam }) => ({
      ...state,
      brokerTeam
    })
  ),
  on(
    actions.brokerContactChange,
    (state: BasicInformationFormValues, { brokerContact }) => ({
      ...state,
      brokerContact
    })
  ),
  on(
    actions.quoteTypeChange,
    (state: BasicInformationFormValues, { quoteType }) => ({
      ...state,
      quoteType
    })
  ),
  on(
    actions.surplusLinesBrokerChange,
    (state: BasicInformationFormValues, { surplusLinesBroker }) => ({
      ...state,
      surplusLinesBroker
    })
  ),
  on(
    actions.insuranceTypeChange,
    (state: BasicInformationFormValues, { insuranceType }) => ({
      ...state,
      insuranceType
    })
  ),
  on(
    actions.productChange,
    (state: BasicInformationFormValues, { product }) => ({
      ...state,
      product
    })
  ),
  on(
    actions.inceptionDateChange,
    (state: BasicInformationFormValues, { inceptionDate }) => {
      let expiryDate: any;
      if (!inceptionDate || typeof inceptionDate.isValid !== "function" || !inceptionDate.isValid()) {
        expiryDate = state.expiryDate;
      }  else {
        expiryDate = inceptionDate.clone();
        expiryDate = expiryDate.add(state.policyPeriod, "months");
      }

      return {
        ...state,
        inceptionDate,
        expiryDate: expiryDate.toDate()
      };
    }
  ),
  on(
    actions.policyPeriodChange,
    (state: BasicInformationFormValues, { policyPeriod }) => {
      const inceptionDate = state.inceptionDate.clone();
      const expiryDate = inceptionDate.add(policyPeriod, "months");

      return {
        ...state,
        policyPeriod,
        expiryDate: expiryDate.toDate()
      };
    }
  ),
  on(
    actions.languageChange,
    (state: BasicInformationFormValues, { language }) => ({
      ...state,
      language
    })
  ),
  on(
    actions.wordingVersionIdChange,
    (state: BasicInformationFormValues, { wordingVersionId }) => ({
      ...state,
      wordingVersionId
    })
  ),
  on(
    actions.localBrokerChange,
    (state: BasicInformationFormValues, { localBroker }) => ({
      ...state,
      localBroker
    })
  ),
  on(
    actions.hasEuSubsidiariesChange,
    (state: BasicInformationFormValues, { hasEuSubsidiaries }) => ({
      ...state,
      hasEuSubsidiaries
    })
  ),
  on(
    actions.assignedContactChange,
    (state: BasicInformationFormValues, { assignedContact }) => ({
      ...state,
      assignedContact
    })
  ),
  on(
    actions.currencyChange,
    (state: BasicInformationFormValues, { currency }) => ({
      ...state,
      currency
    })
  ),
  on(
    actions.addressChange,
    (state: BasicInformationFormValues, { address }) => ({
      ...state,
      address
    })
  ),
  on(
    actions.expiryDateChange,
    (state: BasicInformationFormValues, { expiryDate }) => ({
      ...state,
      expiryDate
    })
  ),
  on(
    actions.expiryPolicyNumberChange,
    (state: BasicInformationFormValues, { expiringPolicyNumber }) => ({
      ...state,
      expiringPolicyNumber
    })
  ),
);
