import { createAction, props } from '@ngrx/store';
import {
  QuoteState
} from '@app/models';

const UPDATE_QUOTE = '[Basic Information] Basic Information Update Quote';

export const updateQuote = createAction(
  UPDATE_QUOTE,
  props<{ quoteState: QuoteState }>()
);
