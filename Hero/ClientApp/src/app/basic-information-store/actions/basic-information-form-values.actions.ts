import { createAction, props } from '@ngrx/store';
import { BasicInformationState } from '@app/basic-information-store/basic-information.state';
import {
  Product,
  BrokerTeam,
  SurplusLine,
  DropDownItem,
  ClientLocation,
  BrokerContact,
  QuoteState
} from '@app/models';
import * as moment from 'moment';

const BASIC_INFORMATION_LOAD = '[Basic Information] Basic Information Load';
const QUOTE_STATE_CHANGE = '[Basic Information] Quote State Change';
const BROKER_TEAM_CHANGE = '[Basic Information] Broker Team Change';
const BROKER_CONTACT_CHANGE = '[Basic Information] Broker Contact Change';
const QUOTE_TYPE_CHANGE = '[Basic Information] Quote Type Change';
const SURPLUS_LINES_BROKER_CHANGE = '[Basic Information] Surplus Line Broker Change';
const INSURANCE_TYPE_CHANGE = '[Basic Information] Insurance Types Change';
const PRODUCT_CHANGE = '[Basic Information] Product Change';
const INCEPTION_DATE_CHANGE = '[Basic Information] Inception Date Change';
const POLICY_PERIOD_CHANGE = '[Basic Information] Policy Period Change';
const LANGUAGE_CHANGE = '[Basic Information] Language Change';
const WORDING_VERSION_ID_CHANGE = '[Basic Information] Wording Version Id Change';
const LOCAL_BROKER_CHANGE = '[Basic Information] Local Broker Change';
const HAS_EU_SUBSIDIARIES_CHANGE = '[Basic Information] Has EU Subsidiaries Change';
const ASSIGNED_CONTACT_CHANGE = '[Basic Information] Assigned Contact Change';
const CURRENCY_CHANGE = '[Basic Information] Currency Change';
const ADDRESS_CHANGE = '[Basic Information] Address Change';
const EXPIRY_DATE_CHANGE = '[Basic Information] Expiry Date Change';
const EXPIRY_POLICY_NUMBER_CHANGE = '[Basic Information] Expiry Policy Number Change';

export const basicInformationLoad = createAction(
  BASIC_INFORMATION_LOAD,
  props<{ stateToLoad: BasicInformationState }>()
);

export const brokerTeamChange = createAction(
  BROKER_TEAM_CHANGE,
  props<{ brokerTeam: BrokerTeam }>()
);

export const quoteStateChange = createAction(
  QUOTE_STATE_CHANGE,
  props<{ quoteState: QuoteState }>()
);

export const brokerContactChange = createAction(
  BROKER_CONTACT_CHANGE,
  props<{ brokerContact: BrokerContact }>()
);

export const localBrokerChange = createAction(
  LOCAL_BROKER_CHANGE,
  props<{ localBroker: BrokerTeam }>()
);

export const surplusLinesBrokerChange = createAction(
  SURPLUS_LINES_BROKER_CHANGE,
  props<{ surplusLinesBroker: SurplusLine }>()
);

export const insuranceTypeChange = createAction(
  INSURANCE_TYPE_CHANGE,
  props<{ insuranceType: number }>()
);

export const addressChange = createAction(
  ADDRESS_CHANGE,
  props<{ address: ClientLocation }>()
);

export const productChange = createAction(
  PRODUCT_CHANGE,
  props<{ product: Product }>()
);

export const hasEuSubsidiariesChange = createAction(
  HAS_EU_SUBSIDIARIES_CHANGE,
  props<{ hasEuSubsidiaries: boolean }>()
);

export const currencyChange = createAction(
  CURRENCY_CHANGE,
  props<{ currency: DropDownItem }>()
);

export const languageChange = createAction(
  LANGUAGE_CHANGE,
  props<{ language: number }>()
);

export const quoteTypeChange = createAction(
  QUOTE_TYPE_CHANGE,
  props<{ quoteType: string }>()
);

export const expiryDateChange = createAction(
  EXPIRY_DATE_CHANGE,
  props<{ expiryDate: Date }>()
);

export const expiryPolicyNumberChange = createAction(
  EXPIRY_POLICY_NUMBER_CHANGE,
  props<{ expiringPolicyNumber: string }>()
);

export const inceptionDateChange = createAction(
  INCEPTION_DATE_CHANGE,
  props<{ inceptionDate: moment.Moment }>()
);

export const policyPeriodChange = createAction(
  POLICY_PERIOD_CHANGE,
  props<{ policyPeriod: number }>()
);

export const wordingVersionIdChange = createAction(
  WORDING_VERSION_ID_CHANGE,
  props<{ wordingVersionId: number }>()
);

export const assignedContactChange = createAction(
  ASSIGNED_CONTACT_CHANGE,
  props<{ assignedContact: DropDownItem }>()
);
