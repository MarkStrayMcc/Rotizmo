import { createSelector, createFeatureSelector } from '@ngrx/store';
import * as fromQuote from '@app/quote-store/reducers/quote.reducer';
import { BasicInformationState } from '@app/basic-information-store/basic-information.state';

const selectQuoteFeature = createFeatureSelector<any, fromQuote.QuoteState>("quote");

export const selectBasicInformation = createSelector(
  selectQuoteFeature,
  (state: fromQuote.QuoteState) => state.basicInformation
);

export const selectBasicInformationFormValues = createSelector(
  selectBasicInformation,
  (state: BasicInformationState) => state.formValues
);

export const selectBasicInformationFormOptions = createSelector(
  selectBasicInformation,
  (state: BasicInformationState) => state.formOptions
);

export const selectBasicInformationFormValidation = createSelector(
  selectBasicInformation,
  (state: BasicInformationState) => state.formValidation
);
