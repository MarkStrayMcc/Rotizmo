import { createAction, props } from '@ngrx/store';

const READONLY_CHANGE = '[Basic Information] ReadOnly Change';
const INSURANCE_TYPES_LOAD_REQUEST = '[Basic Information] Insurance Types Load Request';
const INSURANCE_TYPES_LOAD_SUCCESS = '[Basic Information] Insurance Types Load Success';
const QUOTE_TYPES_LOAD_REQUEST = '[Basic Information] Load Quote Types Load Request';
const QUOTE_TYPES_LOAD_SUCCESS = '[Basic Information] Load Quote Types Load Success';
const CURRENCIES_LOAD_REQUEST = '[Basic Information] Currencies Load Request';
const CURRENCIES_LOAD_SUCCESS = '[Basic Information] Currencies Load Success';
const COUNTRIES_LOAD_REQUEST = '[Basic Information] Countries Load Request';
const COUNTRIES_LOAD_SUCCESS = '[Basic Information] Countries Load Success';
const CFC_CONTACTS_LOAD_REQUEST = '[Basic Information] Cfc Contacts Load Request';
const CFC_CONTACTS_LOAD_SUCCESS = '[Basic Information] Cfc Contacts Load Success';
const LOCAL_BROKERS_LOAD_REQUEST = '[Basic Information] Brokers Load Request';
const LOCAL_BROKERS_LOAD_SUCCESS = '[Basic Information] Brokers Load Success';
const LANGUAGES_LOAD_REQUEST = '[Basic Information] Languages Load Request';
const LANGUAGES_LOAD_SUCCESS = '[Basic Information] Languages Load Success';
const WORDINGS_LOAD_REQUEST = '[Basic Information] Wordings Load Request';
const WORDINGS_LOAD_SUCCESS = '[Basic Information] Wordings Load Success';
const SHOW_LOCAL_BROKER_CHANGE = '[Basic Information] Show Local Broker Change';
const SHOW_SURPLUS_LINES_BROKER_CHANGE = '[Basic Information] Show Surplus Lines Broker Change';

export const readOnlyChange = createAction(
  READONLY_CHANGE,
  props<{ readonly: boolean }>()
);

export const currenciesLoadRequest = createAction(
  CURRENCIES_LOAD_REQUEST
);

export const currenciesLoadSuccess = createAction(
  CURRENCIES_LOAD_SUCCESS,
  props<{ currencies: any }>()
);

export const countriesLoadRequest = createAction(
  COUNTRIES_LOAD_REQUEST
);

export const countriesLoadSuccess = createAction(
  COUNTRIES_LOAD_SUCCESS,
  props<{ countries: any }>()
);

export const cfcContactsLoadRequest = createAction(
  CFC_CONTACTS_LOAD_REQUEST
);

export const cfcContactsLoadSuccess = createAction(
  CFC_CONTACTS_LOAD_SUCCESS,
  props<{ cfcContacts: any }>()
);

export const localBrokersLoadRequest = createAction(
  LOCAL_BROKERS_LOAD_REQUEST
);

export const localBrokersLoadSuccess = createAction(
  LOCAL_BROKERS_LOAD_SUCCESS,
  props<{ localBrokers: any }>()
);

export const insuranceTypesLoadRequest = createAction(
  INSURANCE_TYPES_LOAD_REQUEST
);

export const insuranceTypesLoadSuccess = createAction(
  INSURANCE_TYPES_LOAD_SUCCESS,
  props<{ insuranceTypes: any }>()
);

export const quoteTypesLoadRequest = createAction(
  QUOTE_TYPES_LOAD_REQUEST
);

export const quoteTypesLoadSuccess = createAction(
  QUOTE_TYPES_LOAD_SUCCESS,
  props<{ quoteTypes: any }>()
);

export const languagesLoadRequest = createAction(
  LANGUAGES_LOAD_REQUEST
);

export const languagesLoadSuccess = createAction(
  LANGUAGES_LOAD_SUCCESS,
  props<{ languages: any }>()
);

export const wordingsLoadRequest = createAction(
  WORDINGS_LOAD_REQUEST
);

export const wordingsLoadSuccess = createAction(
  WORDINGS_LOAD_SUCCESS,
  props<{ wordings: any }>()
);

export const showLocalBrokerChange = createAction(
  SHOW_LOCAL_BROKER_CHANGE,
  props<{ showLocalBroker: boolean }>()
);

export const showSurplusLinesBrokerChange = createAction(
  SHOW_SURPLUS_LINES_BROKER_CHANGE,
  props<{ showSurplusLinesBroker: boolean }>()
);
