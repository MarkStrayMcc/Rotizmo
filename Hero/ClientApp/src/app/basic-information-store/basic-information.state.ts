import {
  SurplusLine,
  Product,
  BrokerTeam,
  DropDownItem,
  Client,
  ClientLocation,
  QuoteState,
  BrokerContact
} from '@app/models'
import * as moment from 'moment';

/**
 * Represents a basic information state. It has been split into three parts:
 * formValues - which keeps all currently selected values for the form
 * formOptions - which keeps the form state (i.e. readonly) and dropdown values
 * formValidation - which keeps validation errors
 */
export interface BasicInformationState {
  formValues: BasicInformationFormValues;
  formOptions: BasicInformationFormOptions;
  formValidation: BasicInformationFormValidation;
}

export interface BasicInformationFormValues {
  quoteState: QuoteState;
  client: Client;
  address: ClientLocation;
  brokerTeam: BrokerTeam;
  brokerContact: BrokerContact;
  quoteType: string;
  surplusLinesBroker: SurplusLine;
  insuranceType: number;
  product: Product;
  inceptionDate: moment.Moment;
  policyPeriod: number;
  language: number;
  wordingVersionId: number;
  localBroker: BrokerTeam;
  expiringPolicyNumber: string;
  hasEuSubsidiaries: boolean;
  assignedContact: DropDownItem;
  currency: DropDownItem;
  expiryDate: Date;
}

export interface BasicInformationFormOptions {
  readonly: boolean;
  showLocalBroker: boolean;
  showSurplusLinesBroker: boolean;
  currencies: any;
  countries: any;
  cfcContacts: any;
  localBrokers: any;
  insuranceTypes: any;
  quoteTypes: any;
  languages: any;
  wordings: any;
}

export interface BasicInformationFormValidation {
  isAuthorisedLocation: boolean;
}
