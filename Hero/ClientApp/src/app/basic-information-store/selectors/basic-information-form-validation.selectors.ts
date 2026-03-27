import { createSelector } from '@ngrx/store';
import { selectBasicInformationFormValidation } from '@app/basic-information-store/selectors/basic-information.selectors';

export const selectBasicInformationIsAuthorisedLocation = createSelector(
  selectBasicInformationFormValidation,
  (state) => state.isAuthorisedLocation
);
