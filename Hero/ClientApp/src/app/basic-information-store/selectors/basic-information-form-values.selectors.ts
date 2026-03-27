import { createSelector } from '@ngrx/store';
import { selectBasicInformationFormValues } from '@app/basic-information-store/selectors/basic-information.selectors';

export const selectBasicInformationQuoteState = createSelector(
  selectBasicInformationFormValues,
  (state) => state.quoteState
);

export const selectBasicInformationInsuranceType = createSelector(
  selectBasicInformationFormValues,
  (state) => state.insuranceType
);

export const selectBasicInformationProduct = createSelector(
  selectBasicInformationFormValues,
  (state) => state.product
);

export const selectBasicInformationBrokerTeam = createSelector(
  selectBasicInformationFormValues,
  (state) => state.brokerTeam
);

export const selectBasicInformationQuoteType = createSelector(
  selectBasicInformationFormValues,
  (state) => state.quoteType
);

export const selectBasicInformationSurplusLineBroker = createSelector(
  selectBasicInformationFormValues,
  (state) => state.surplusLinesBroker
);

export const selectBasicInformationInceptionDate = createSelector(
  selectBasicInformationFormValues,
  (state) => state.inceptionDate
);

export const selectBasicInformationPolicyPeriod = createSelector(
  selectBasicInformationFormValues,
  (state) => state.policyPeriod
);

export const selectBasicInformationLanguage = createSelector(
  selectBasicInformationFormValues,
  (state) => state.language
);

export const selectBasicInformationWordingVersionId = createSelector(
  selectBasicInformationFormValues,
  (state) => state.wordingVersionId
);

export const selectBasicInformationLocalBroker = createSelector(
  selectBasicInformationFormValues,
  (state) => state.localBroker
);

export const selectBasicInformationHasEuSubsidiary = createSelector(
  selectBasicInformationFormValues,
  (state) => state.hasEuSubsidiaries
);

export const selectBasicInformationAssignedContact = createSelector(
  selectBasicInformationFormValues,
  (state) => state.assignedContact
);

export const selectBasicInformationCurrency = createSelector(
  selectBasicInformationFormValues,
  (state) => state.currency
);

export const selectBasicInformationAddress = createSelector(
  selectBasicInformationFormValues,
  (state) => state.address
);

export const selectBasicInformationExpiryDate = createSelector(
  selectBasicInformationFormValues,
  (state) => state.expiryDate
);

export const selectBasicInformationExpiryPolicyNumber = createSelector(
  selectBasicInformationFormValues,
  (state) => state.expiringPolicyNumber
);

export const selectBasicInformationTerritory = createSelector(
  selectBasicInformationFormValues,
  (state) => {
    let countryIso: string;

    if (state.address && state.address.country) {
      countryIso = state.address.country.isoCode;
    } else if (state.client && state.client.primaryLocation &&  state.client.primaryLocation.country) {
      countryIso = state.client.primaryLocation.country.isoCode;
    }

    return countryIso;
  }
);
