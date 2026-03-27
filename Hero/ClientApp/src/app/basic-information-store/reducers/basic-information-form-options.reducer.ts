import { createReducer, on } from '@ngrx/store';
import { BasicInformationFormOptions } from '@app/basic-information-store/basic-information.state';
import * as actions from '@app/basic-information-store/actions';

export const initialFormOptionsState: BasicInformationFormOptions = {
  readonly: false,
  showLocalBroker: false,
  showSurplusLinesBroker: false,
  currencies: null,
  countries: null,
  cfcContacts: null,
  localBrokers: null,
  insuranceTypes: null,
  quoteTypes: null,
  languages: null,
  wordings: null,
};

export const basicInformationFormOptionsReducer = createReducer(
  initialFormOptionsState,
  on(
    actions.basicInformationLoad,
    (state: BasicInformationFormOptions, { stateToLoad }) => ({
      ...state,
      readonly: stateToLoad.formOptions.readonly,
      showLocalBroker: stateToLoad.formOptions.showLocalBroker,
      showSurplusLinesBroker: stateToLoad.formOptions.showSurplusLinesBroker,
    })
  ),
  on(
    actions.readOnlyChange,
    (state: BasicInformationFormOptions, { readonly }) => ({
      ...state,
      readonly
    })
  ),
  on(
    actions.currenciesLoadSuccess,
    (state: BasicInformationFormOptions, { currencies }) => ({
      ...state,
      currencies
    })
  ),
  on(
    actions.countriesLoadSuccess,
    (state: BasicInformationFormOptions, { countries }) => ({
      ...state,
      countries
    })
  ),
  on(
    actions.insuranceTypesLoadSuccess,
    (state: BasicInformationFormOptions, { insuranceTypes }) => ({
      ...state,
      insuranceTypes
    })
  ),
  on(
    actions.cfcContactsLoadSuccess,
    (state: BasicInformationFormOptions, { cfcContacts }) => ({
      ...state,
      cfcContacts
    })
  ),
  on(
    actions.localBrokersLoadSuccess,
    (state: BasicInformationFormOptions, { localBrokers }) => ({
      ...state,
      localBrokers
    })
  ),
  on(
    actions.quoteTypesLoadSuccess,
    (state: BasicInformationFormOptions, { quoteTypes }) => ({
      ...state,
      quoteTypes
    })
  ),
  on(
    actions.languagesLoadSuccess,
    (state: BasicInformationFormOptions, { languages }) => ({
      ...state,
      languages
    })
  ),
  on(
    actions.wordingsLoadSuccess,
    (state: BasicInformationFormOptions, { wordings }) => ({
      ...state,
      wordings
    })
  ),
  on(
    actions.showLocalBrokerChange,
    (state: BasicInformationFormOptions, { showLocalBroker }) => ({
        ...state,
        showLocalBroker
    })
  ),
  on(
    actions.showSurplusLinesBrokerChange,
    (state: BasicInformationFormOptions, { showSurplusLinesBroker }) => ({
        ...state,
        showSurplusLinesBroker
    })
  ),
);
