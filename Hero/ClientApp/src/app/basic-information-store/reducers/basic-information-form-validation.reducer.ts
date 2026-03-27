import { createReducer, on } from '@ngrx/store';
import { BasicInformationFormValidation } from '@app/basic-information-store/basic-information.state';
import * as actions from '@app/basic-information-store/actions';

export const intialFormValidationState: BasicInformationFormValidation = {
  isAuthorisedLocation: false
};

export const basicInformationFormValidationReducer = createReducer(
  intialFormValidationState,
  on(
    actions.basicInformationLoad,
    (state: BasicInformationFormValidation, { stateToLoad }) => ({
      ...state,
      isAuthorisedLocation: stateToLoad.formValidation.isAuthorisedLocation
    })
  ),
  on(
    actions.checkLocationAuthorityDone,
    (state: BasicInformationFormValidation, { isAuthorised }) => ({
      ...state,
      isAuthorisedLocation: isAuthorised
    })
  )
);
