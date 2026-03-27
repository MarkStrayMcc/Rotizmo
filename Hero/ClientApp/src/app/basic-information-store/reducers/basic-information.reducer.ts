import { combineReducers } from '@ngrx/store';
import { basicInformationFormValidationReducer } from '@app/basic-information-store/reducers/basic-information-form-validation.reducer';
import { basicInformationFormValuesReducer } from '@app/basic-information-store/reducers/basic-information-form-values.reducer';
import { basicInformationFormOptionsReducer } from '@app/basic-information-store/reducers/basic-information-form-options.reducer';

export const reducers = combineReducers({
  formValues: basicInformationFormValuesReducer,
  formOptions: basicInformationFormOptionsReducer,
  formValidation: basicInformationFormValidationReducer
});
