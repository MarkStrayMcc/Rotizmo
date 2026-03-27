import { ActionReducerMap } from '@ngrx/store';
import * as fromBasicInformation from '@app/basic-information-store';
import * as fromRoot from '@app/root-store/root.state';

export interface QuoteState extends fromRoot.State {
  basicInformation: fromBasicInformation.BasicInformationState;
}

export const reducers: ActionReducerMap<QuoteState> = {
  basicInformation: fromBasicInformation.reducers
};
