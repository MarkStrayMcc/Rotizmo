import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { map, mergeMap, withLatestFrom, tap, concatMap } from "rxjs/operators";
import { DropdownService } from "@app/services/dropdown.service";
import { WordingVersionHttpService } from "@app/quote/services/wording-version/wording-version-http-service";
import { QuoteState } from "@app/models";
import { UserService } from "@app/services/user.service";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { BasicInformationState } from "@app/basic-information-store/basic-information.state";
import * as actions from "@app/basic-information-store/actions";
import * as selectors from "@app/basic-information-store/selectors";
import { isUnitedStates, isCanada, isCanadianBroker, isAdmitted } from "@app/helpers";
import { BrokerTeamHttpService } from "@app/quote/services/broker-team.http-service";

@Injectable()
export class BasicInformationEffects {
    loadBasicInformation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.basicInformationLoad),
            mergeMap(() => [
                actions.currenciesLoadRequest(),
                actions.countriesLoadRequest(),
                actions.cfcContactsLoadRequest(),
                actions.insuranceTypesLoadRequest(),
                actions.quoteTypesLoadRequest(),
                actions.languagesLoadRequest(),
                actions.localBrokersLoadRequest(),
                actions.wordingsLoadRequest()
            ])
        )
    );

    loadCurrencies$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.currenciesLoadRequest),
            mergeMap(() =>
                this.dropdownService
                    .getCurrencies()
                    .pipe(
                        map(currencies => actions.currenciesLoadSuccess({ currencies }))
                    )
            )
        )
    );

    loadCountries$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.countriesLoadRequest),
            mergeMap(() =>
                this.dropdownService
                    .getCountries()
                    .pipe(map(countries => actions.countriesLoadSuccess({ countries })))
            )
        )
    );

    loadCfcContacts$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.cfcContactsLoadRequest),
            mergeMap(() =>
                this.dropdownService
                    .getCfcContacts()
                    .pipe(
                        map(cfcContacts => actions.cfcContactsLoadSuccess({ cfcContacts }))
                    )
            )
        )
    );

    loadInsuranceTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.insuranceTypesLoadRequest),
            mergeMap(() =>
                this.dropdownService
                    .getInsuranceTypes()
                    .pipe(
                        map(insuranceTypes =>
                            actions.insuranceTypesLoadSuccess({ insuranceTypes })
                        )
                    )
            )
        )
    );

    loadQuoteTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.quoteTypesLoadRequest),
            mergeMap(() =>
                this.dropdownService
                    .getQuoteTypes()
                    .pipe(
                        map(quoteTypes => actions.quoteTypesLoadSuccess({ quoteTypes }))
                    )
            )
        )
    );

    loadLanguages$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.languagesLoadRequest),
            mergeMap(() =>
                this.dropdownService
                    .getLanguages()
                    .pipe(map(languages => actions.languagesLoadSuccess({ languages })))
            )
        )
    );

    loadLocalBrokers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.localBrokersLoadRequest),
            withLatestFrom(
                this.store$.select(selectors.selectBasicInformationAddress)
            ),
            mergeMap(([_, address]) =>
                this.brokerTeamHttpService
                    .get([address.country.isoCode])
                    .pipe(
                        map(localBrokers =>
                            actions.localBrokersLoadSuccess({ localBrokers })
                        )
                    )
            )
        )
    );

    loadWordings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                actions.wordingsLoadRequest,
                actions.productChange,
                actions.addressChange,
                actions.languageChange
            ),
            withLatestFrom(
                this.store$.select(selectors.selectBasicInformationProduct),
                this.store$.select(selectors.selectBasicInformationTerritory)
            ),
            mergeMap(([action, product, territory]) => {
                if (product) {
                    return this.wordingService
                        .getWordingVersions(product.productName, territory, "en")
                        .pipe(map(wordings => actions.wordingsLoadSuccess({ wordings })));
                }

                return of(actions.wordingsLoadSuccess({ wordings: null }));
            })
        )
    );

    checkLocationAuthority$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                actions.basicInformationLoad,
                actions.addressChange,
                actions.checkLocationAuthority
            ),
            withLatestFrom(
                this.store$.select(selectors.selectBasicInformationAddress),
                this.store$.select(selectors.selectBasicInformationQuoteState)
            ),
            mergeMap(([action, address, quoteState]) => {
                let isAuthorised = false;

                if (address && address.country) {
                    if (quoteState < QuoteState.Approved) {
                        return this.userService.getData().pipe(
                            map(() => {
                                isAuthorised = this.userService.isLocationAllowedToBind(
                                    address.country.isoCode,
                                    address.stateProvinceCode
                                );

                                return actions.checkLocationAuthorityDone({ isAuthorised });
                            })
                        );
                    } else {
                        isAuthorised = true;
                    }
                }

                return of(actions.checkLocationAuthorityDone({ isAuthorised }));
            })
        )
    );

    showSurplusLinesBroker$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.addressChange, actions.productChange),
            withLatestFrom(
                this.store$.select(selectors.selectBasicInformationAddress),
                this.store$.select(selectors.selectBasicInformationProduct)
            ),
            mergeMap(([action, address, product]) => {
                const showSurplusLinesBroker = isUnitedStates(address) && !isAdmitted(product);

                if (showSurplusLinesBroker) {
                    return of(
                        actions.showSurplusLinesBrokerChange({ showSurplusLinesBroker })
                    );
                }

                return of(
                    actions.showSurplusLinesBrokerChange({ showSurplusLinesBroker }),
                    actions.surplusLinesBrokerChange({ surplusLinesBroker: null })
                );
            })
        )
    );

    showLocalBroker$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.addressChange),
            withLatestFrom(
                this.store$.select(selectors.selectBasicInformationAddress),
                this.store$.select(selectors.selectBasicInformationBrokerTeam)
            ),
            mergeMap(([action, address, brokerTeam]) => {
                const showLocalBroker = isCanada(address) && !isCanadianBroker(brokerTeam);

                if (showLocalBroker) {
                    return of(actions.showLocalBrokerChange({ showLocalBroker }));
                }

                return of(
                    actions.showLocalBrokerChange({ showLocalBroker }),
                    actions.localBrokerChange({ localBroker: null })
                );
            })
        )
    );

    updateGstTax$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(actions.inceptionDateChange),
                concatMap(action =>
                    of(action).pipe(
                        withLatestFrom(
                            this.store$.select(selectors.selectBasicInformationInceptionDate)
                        )
                    )
                ),
                tap(([action, incepctionDate]) => {
                    this.taxService.updateGSTRate(incepctionDate.toDate());
                })
            ),
        { dispatch: false }
    );

    updateCurrency$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.addressChange),
            withLatestFrom(
                this.store$.select(selectors.selectBasicInformationAddress)
            ),
            mergeMap(([action, address]) => {
                return this.dropdownService
                    .getCurrencyByCountryId(address.country.countryId)
                    .pipe(map(val => actions.currencyChange({ currency: val })));
            })
        )
    );

    updateQuote$ = createEffect(() =>
        this.actions$.pipe(
            ofType(actions.updateQuote),
            mergeMap(action => {
                const quoteState = action.quoteState;
                const isReadOnly = quoteState !== QuoteState.InProgress;

                return [
                    actions.quoteStateChange({ quoteState }),
                    actions.readOnlyChange({ readonly: isReadOnly }),
                    actions.checkLocationAuthority()
                ];
            })
        )
    );

    constructor(
        private actions$: Actions,
        private readonly brokerTeamHttpService: BrokerTeamHttpService,
        private readonly dropdownService: DropdownService,
        private readonly wordingService: WordingVersionHttpService,
        private readonly userService: UserService,
        private readonly taxService: GoodsAndServicesTaxService,
        private store$: Store<BasicInformationState>
    ) { }
}
