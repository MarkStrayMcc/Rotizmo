import { createSelector } from '@ngrx/store';
import { selectBasicInformationFormOptions } from '@app/basic-information-store/selectors/basic-information.selectors';

export const selectBasicInformationReadonly = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.readonly
);

export const selectBasicInformationShowLocalBroker = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.showLocalBroker
);

export const selectBasicInformationShowSurplusLinesBroker = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.showSurplusLinesBroker
);

// DropDown selectors:

export const selectCurrencies = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.currencies
);

export const selectCountries = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.countries
);

export const selectCfcContacts = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.cfcContacts
);

export const selectLocalBrokers = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.localBrokers
);

export const selectInsuranceTypes = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.insuranceTypes
);

export const selectQuoteTypes = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.quoteTypes
);

export const selectLanguages = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.languages
);

export const selectWordings = createSelector(
  selectBasicInformationFormOptions,
  (state) => state.wordings
);
