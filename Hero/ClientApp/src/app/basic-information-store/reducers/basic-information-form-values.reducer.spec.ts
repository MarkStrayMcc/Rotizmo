import { TestBed, async } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';

import * as actions from '@app/basic-information-store/actions';
import * as reducers from '@app/basic-information-store/reducers';
import * as moment from 'moment';

describe('BasicInformationFormValuesReducer', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        Actions,
        provideMockStore({ })
      ],
    });
  }));

  it('should update expiry date on inception date change', () => {
    const date = moment(new Date());

    const action = actions.inceptionDateChange({ inceptionDate: date.clone() });
    const result = reducers.basicInformationFormValuesReducer(undefined, action);

    const state = reducers.intialFormValuesState;
    const inceptionDate = date.clone();
    const expiryDate = date.clone().add(state.policyPeriod, "months").toDate();

    state.inceptionDate = inceptionDate;
    state.expiryDate = expiryDate;

    expect(result).not.toBe(state);
    expect(result).toEqual(state);
  });

  it('should update expiry date on policy period change', () => {
    const state = reducers.intialFormValuesState;
    const date = moment(new Date());
    const inceptionDate = date.clone();
    const policyPeriod = 250;
    state.inceptionDate = inceptionDate;
    state.policyPeriod = 1;

    const action = actions.policyPeriodChange({ policyPeriod });
    const result = reducers.basicInformationFormValuesReducer(state, action);

    const expiryDate = date.clone().add(policyPeriod, "months").toDate();
    state.policyPeriod = policyPeriod;
    state.expiryDate = expiryDate;

    expect(result).not.toBe(state);
    expect(result).toEqual(state);
  });
});
