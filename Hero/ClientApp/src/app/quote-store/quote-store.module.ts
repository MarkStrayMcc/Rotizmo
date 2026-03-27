import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import * as fromQuote from './index';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('quote', fromQuote.reducers),
    EffectsModule.forFeature(fromQuote.effects)
  ],
  declarations: []
})
export class QuoteStoreModule {
}
