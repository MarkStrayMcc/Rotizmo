import { createAction, props } from '@ngrx/store';

const CHECK_LOCATION_AUTHORITY = '[Basic Information] Check Location Authority';
const CHECK_LOCATION_AUTHORITY_DONE = '[Basic Information] Check Location Authority Done';

export const checkLocationAuthority = createAction(
  CHECK_LOCATION_AUTHORITY
);

export const checkLocationAuthorityDone = createAction(
  CHECK_LOCATION_AUTHORITY_DONE,
  props<{ isAuthorised: boolean }>()
);
