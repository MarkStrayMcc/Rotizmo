import { TestBed, async } from "@angular/core/testing";
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { Action, Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { Observable, of } from "rxjs";
import { take, skip } from "rxjs/operators";

import * as actions from "@app/basic-information-store/actions";
import * as selectors from "@app/basic-information-store/selectors";
import { BasicInformationEffects, BasicInformationState } from "@app/basic-information-store";
import { DropdownService } from "@app/services/dropdown.service";
import { WordingVersionHttpService } from "@app/quote/services/wording-version/wording-version-http-service";
import { UserService } from "@app/services/user.service";
import { GoodsAndServicesTaxService } from "@app/quote/services/goods-and-services-tax.service";
import { ClientLocation, Country, Product, QuoteState } from "@app/models";
import * as moment from "moment";
import { BrokerTeamHttpService } from "@app/quote/services/broker-team.http-service";

xdescribe("BasicInformationEffects", () => {
  class MockDropdownService {
    public getCurrencies() { return of([]); }
    public getCountries() { return of([]); }
    public getLanguages() { return of([]); }
    public getCfcContacts() { return of([]); }
    public getInsuranceTypes() { return of([]); }
    public getQuoteTypes() { return of([]); }
    public getCurrencyByCountryId(countryId: number) { return of(null); }
  }

  class MockWordingVersionHttpService {
    public getWordingVersions(params: any) { return of([]); }
  }

  let isLocationAllowed = true;
  class MockUserService {
    public getData() { return of(null); }
    public isLocationAllowedToBind(isoCode: string) { return isLocationAllowed; }
  }

  class MockGoodsAndServicesTaxService {
    public updateGSTRate() { return of(1); }
  }

  let store: MockStore<BasicInformationState>;
  let actions$: Observable<Action>;
  let effects: BasicInformationEffects;
  let brokerTeamHttpService: BrokerTeamHttpService;
  let dropdownService: DropdownService;
  let wordingService: WordingVersionHttpService;
  let userService: UserService;
  let goodsAndServicesTaxService: GoodsAndServicesTaxService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        BasicInformationEffects,
        Actions,
        { provide: BrokerTeamHttpService, useValue: { get: () => of() } },
        { provide: DropdownService, useClass: MockDropdownService },
        { provide: WordingVersionHttpService, useClass: MockWordingVersionHttpService },
        { provide: UserService, useClass: MockUserService },
        { provide: GoodsAndServicesTaxService, useClass: MockGoodsAndServicesTaxService },
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            {
              selector: selectors.selectBasicInformationTerritory,
              value: null
            },
            {
              selector: selectors.selectBasicInformationBrokerTeam,
              value: null
            },
            {
              selector: selectors.selectBasicInformationQuoteState,
              value: QuoteState.InProgress
            },
          ]
        })
      ],
    });

    store = TestBed.get<Store<BasicInformationState>>(Store);
    effects = TestBed.inject<BasicInformationEffects>(BasicInformationEffects);
    brokerTeamHttpService = TestBed.inject(BrokerTeamHttpService);
    dropdownService = TestBed.inject<DropdownService>(DropdownService);
    wordingService = TestBed.inject<WordingVersionHttpService>(WordingVersionHttpService);
    userService = TestBed.inject<UserService>(UserService);
    goodsAndServicesTaxService = TestBed.inject<GoodsAndServicesTaxService>(GoodsAndServicesTaxService);
  }));

  it("should dispatch dropdown loading actions on state load", () => {
    actions$ = of(actions.basicInformationLoad({ stateToLoad: null }));

    effects.loadBasicInformation$
      .pipe(take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.currenciesLoadRequest());
      }
      );

    effects.loadBasicInformation$
      .pipe(skip(1), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.countriesLoadRequest());
      }
      );

    effects.loadBasicInformation$
      .pipe(skip(2), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.cfcContactsLoadRequest());
      }
      );

    effects.loadBasicInformation$
      .pipe(skip(3), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.insuranceTypesLoadRequest());
      }
      );

    effects.loadBasicInformation$
      .pipe(skip(4), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.quoteTypesLoadRequest());
      }
      );

    effects.loadBasicInformation$
      .pipe(skip(5), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.languagesLoadRequest());
      }
      );

    effects.loadBasicInformation$
      .pipe(skip(6), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.localBrokersLoadRequest());
      }
      );

    effects.loadBasicInformation$
      .pipe(skip(7), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.wordingsLoadRequest());
      }
      );
  });

  it("should dispatch success action on loading currencies", () => {
    actions$ = of(actions.currenciesLoadRequest());

    effects.loadCurrencies$.subscribe(action => {
      expect(action).toEqual(actions.currenciesLoadSuccess({ currencies: [] }));
    }
    );
  });

  it("should call dropdownService once on loading currencies", () => {
    actions$ = of(actions.currenciesLoadRequest());

    spyOn(dropdownService, "getCurrencies").and.callThrough();

    effects.loadCurrencies$.subscribe(action => {
      expect(dropdownService.getCurrencies).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should dispatch success action on loading countries", () => {
    actions$ = of(actions.countriesLoadRequest());

    effects.loadCountries$.subscribe(action => {
      expect(action).toEqual(actions.countriesLoadSuccess({ countries: [] }));
    }
    );
  });

  it("should call dropdownService once on loading countries", () => {
    actions$ = of(actions.countriesLoadRequest());

    spyOn(dropdownService, "getCountries").and.callThrough();

    effects.loadCountries$.subscribe(action => {
      expect(dropdownService.getCountries).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should dispatch success action on loading cfcContacts", () => {
    actions$ = of(actions.cfcContactsLoadRequest());

    effects.loadCfcContacts$.subscribe(action => {
      expect(action).toEqual(actions.cfcContactsLoadSuccess({ cfcContacts: [] }));
    }
    );
  });

  it("should call dropdownService once on loading cfcContacts", () => {
    actions$ = of(actions.cfcContactsLoadRequest());

    spyOn(dropdownService, "getCfcContacts").and.callThrough();

    effects.loadCfcContacts$.subscribe(action => {
      expect(dropdownService.getCfcContacts).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should dispatch success action on loading insurance types", () => {
    actions$ = of(actions.insuranceTypesLoadRequest());

    effects.loadInsuranceTypes$.subscribe(action => {
      expect(action).toEqual(actions.insuranceTypesLoadSuccess({ insuranceTypes: [] }));
    }
    );
  });

  it("should call dropdownService once on loading insurance types", () => {
    actions$ = of(actions.insuranceTypesLoadRequest());

    spyOn(dropdownService, "getInsuranceTypes").and.callThrough();

    effects.loadInsuranceTypes$.subscribe(action => {
      expect(dropdownService.getInsuranceTypes).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should dispatch success action on loading quote types", () => {
    actions$ = of(actions.quoteTypesLoadRequest());

    effects.loadQuoteTypes$.subscribe(action => {
      expect(action).toEqual(actions.quoteTypesLoadSuccess({ quoteTypes: [] }));
    }
    );
  });

  it("should call dropdownService once on loading quote types", () => {
    actions$ = of(actions.quoteTypesLoadRequest());

    spyOn(dropdownService, "getQuoteTypes").and.callThrough();

    effects.loadQuoteTypes$.subscribe(action => {
      expect(dropdownService.getQuoteTypes).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should dispatch success action on loading languages", () => {
    actions$ = of(actions.languagesLoadRequest());

    effects.loadLanguages$.subscribe(action => {
      expect(action).toEqual(actions.languagesLoadSuccess({ languages: [] }));
    }
    );
  });

  it("should call dropdownService once on loading languages", () => {
    actions$ = of(actions.languagesLoadRequest());

    spyOn(dropdownService, "getLanguages").and.callThrough();

    effects.loadLanguages$.subscribe(action => {
      expect(dropdownService.getLanguages).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should dispatch success action on loading local brokers", () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);

    actions$ = of(actions.localBrokersLoadRequest());

    effects.loadLocalBrokers$.subscribe(action => {
      expect(action).toEqual(actions.localBrokersLoadSuccess({ localBrokers: [] }));
    }
    );
  });

  it("should call dropdownService once on loading local brokers", () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);

    actions$ = of(actions.localBrokersLoadRequest());

    spyOn(brokerTeamHttpService, "get").and.callThrough();

    effects.loadLanguages$.subscribe(() => {
      expect(brokerTeamHttpService.get).toHaveBeenCalledTimes(1);
      expect(brokerTeamHttpService.get).toHaveBeenCalledWith([address.country.isoCode]);
    });
  });

  it("should dispatch success action with no items on loading wordings when no product selected", () => {
    actions$ = of(actions.wordingsLoadRequest());
    store.overrideSelector(selectors.selectBasicInformationProduct, null);

    effects.loadWordings$.subscribe(action => {
      expect(action).toEqual(actions.wordingsLoadSuccess({ wordings: null }));
    }
    );
  });

  it("should dispatch success action with items on loading wordings when product selected", () => {
    actions$ = of(actions.wordingsLoadRequest());
    store.overrideSelector(selectors.selectBasicInformationProduct, new Product());

    effects.loadWordings$.subscribe(action => {
      expect(action).toEqual(actions.wordingsLoadSuccess({ wordings: [] }));
    }
    );
  });

  it("should NOT call wordingService once on loading wordings when no product selected", () => {
    actions$ = of(actions.wordingsLoadRequest());
    store.overrideSelector(selectors.selectBasicInformationProduct, null);

    spyOn(wordingService, "getWordingVersions").and.callThrough();

    effects.loadWordings$.subscribe(action => {
      expect(wordingService.getWordingVersions).toHaveBeenCalledTimes(0);
    }
    );
  });

  it("should call wordingService once on loading wordings when product selected", () => {
    actions$ = of(actions.wordingsLoadRequest());
    store.overrideSelector(selectors.selectBasicInformationProduct, new Product());

    spyOn(wordingService, "getWordingVersions").and.callThrough();

    effects.loadWordings$.subscribe(action => {
      expect(wordingService.getWordingVersions).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should dispatch success action with positive result on check country authority", () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);
    isLocationAllowed = true;

    actions$ = of(actions.addressChange({ address }));

    effects.checkLocationAuthority$.subscribe(action => {
        expect(action).toEqual(actions.checkLocationAuthorityDone( { isAuthorised: true } ));
    }
    );
  });

  it('should call userService once on checking location authority', () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);
    isLocationAllowed = true;
    actions$ = of(actions.addressChange({ address }));

    spyOn(userService, "isLocationAllowedToBind").and.callThrough();

    effects.loadLanguages$.subscribe(action => {
        expect(userService.isLocationAllowedToBind).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should dispatch success action with negative result on check country authority", () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);
    isLocationAllowed = false;

    actions$ = of(actions.addressChange({ address }));

    effects.checkLocationAuthority$.subscribe(action => {
        expect(action).toEqual(actions.checkLocationAuthorityDone( { isAuthorised: false } ));
    }
    );
  });

  it("should not display surplus lines broker when the country changes to other than the USA", () => {
    const address = createNonUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);
    store.overrideSelector(selectors.selectBasicInformationProduct, createNonAdmittedProduct());

    actions$ = of(actions.addressChange({ address }));

    effects.showSurplusLinesBroker$.pipe(take(1)).subscribe(action => {
      expect(action).toEqual(actions.showSurplusLinesBrokerChange({ showSurplusLinesBroker: false }));
    });
  });

  it("should display surplus lines broker when the country changes to USA and the product is non-admitted", () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);
    store.overrideSelector(selectors.selectBasicInformationProduct, createNonAdmittedProduct());

    actions$ = of(actions.addressChange({ address }));

    effects.showSurplusLinesBroker$.pipe(take(1)).subscribe(action => {
      expect(action).toEqual(actions.showSurplusLinesBrokerChange({ showSurplusLinesBroker: true }));
    });
  });

  it("should hide surplus lines broker when the country changes to USA and the product is admitted", () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);
    store.overrideSelector(selectors.selectBasicInformationProduct, createAdmittedProduct());

    actions$ = of(actions.addressChange({ address }));

    effects.showSurplusLinesBroker$.pipe(take(1)).subscribe(action => {
      expect(action).toEqual(actions.showSurplusLinesBrokerChange({ showSurplusLinesBroker: false }));
    });
  });

  it("should display surplus lines broker when the product changes to non-admitted and the country is USA", () => {
    const address = createUsaAddress();
    const product = createNonAdmittedProduct();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);
    store.overrideSelector(selectors.selectBasicInformationProduct, product);

    actions$ = of(actions.productChange({ product }));

    effects.showSurplusLinesBroker$.pipe(take(1)).subscribe(action => {
      expect(action).toEqual(actions.showSurplusLinesBrokerChange({ showSurplusLinesBroker: true }));
    });
  });

  it("should hide surplus lines broker when the product changes to admitted and the country is USA", () => {
    const address = createUsaAddress();
    const product = createAdmittedProduct();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);
    store.overrideSelector(selectors.selectBasicInformationProduct, product);

    actions$ = of(actions.productChange({ product }));

    effects.showSurplusLinesBroker$.pipe(take(1)).subscribe(action => {
      expect(action).toEqual(actions.showSurplusLinesBrokerChange({ showSurplusLinesBroker: false }));
    });
  });

  it("should display local broker when the country changes to Canada", () => {
    const address = createCanadaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);

    actions$ = of(actions.addressChange({ address }));

    effects.showLocalBroker$.pipe(take(1)).subscribe(action => {
      expect(action).toEqual(actions.showLocalBrokerChange({ showLocalBroker: true }));
    }
    );
  });

  it("should not display local broker when the country changes to other than Canada", () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);

    actions$ = of(actions.addressChange({ address }));

    effects.showLocalBroker$.pipe(take(1)).subscribe(action => {
      expect(action).toEqual(actions.showLocalBrokerChange({ showLocalBroker: false }));
    }
    );
  });

  function createUsaAddress(): ClientLocation {
    const address = new ClientLocation();
    address.country = new Country();
    address.country.isoCode = "US";
    address.country.countryId = 4;

    return address;
  }

  function createUkAddress(): ClientLocation {
    const address = new ClientLocation();
    address.country = new Country();
    address.country.isoCode = "GB";
    address.country.countryId = 1;

    return address;
  }

  function createAdmittedProduct(): Product {
    return {
      productName: "IMI",
      isAdmitted: true,
      productId: 2,
      productDisplay: "Investment Management Insurance"
    } as Product;
  }

  function createNonAdmittedProduct(): Product {
    return {
      productName: "IMI",
      isAdmitted: false,
      productId: 2,
      productDisplay: "Investment Management Insurance"
    } as Product;
  }

  it("should call taxService once on change of inception date", () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationInceptionDate, moment(new Date()));

    actions$ = of(actions.inceptionDateChange(null));

    spyOn(goodsAndServicesTaxService, "updateGSTRate").and.callThrough();

    effects.updateGstTax$.subscribe(action => {
      expect(goodsAndServicesTaxService.updateGSTRate).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should get currency on change of address", () => {
    const address = createUsaAddress();
    store.overrideSelector(selectors.selectBasicInformationAddress, address);

    actions$ = of(actions.addressChange({ address }));

    spyOn(dropdownService, "getCurrencyByCountryId").and.callThrough();

    effects.updateCurrency$.subscribe(action => {
      expect(dropdownService.getCurrencyByCountryId).toHaveBeenCalledTimes(1);
    }
    );
  });

  it("should dispatch three actions on update quote", () => {
    const quoteState = QuoteState.InProgress;
    actions$ = of(actions.updateQuote({ quoteState }));

    effects.updateQuote$
      .pipe(skip(0), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.quoteStateChange({ quoteState }));
      }
      );

    effects.updateQuote$
      .pipe(skip(1), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.readOnlyChange({ readonly: false }));
      }
      );

    effects.updateQuote$
      .pipe(skip(2), take(1))
      .subscribe(action => {
        expect(action).toEqual(actions.checkLocationAuthority());
      }
      );
  });

  function createCanadaAddress(): ClientLocation {
    const address = new ClientLocation();
    address.country = new Country();
    address.country.isoCode = "CA";
    address.country.countryId = 1;

    return address;
  }

  function createNonUsaAddress(): ClientLocation {
    const address = new ClientLocation();
    address.country = new Country();
    address.country.isoCode = "XX";
    address.country.countryId = 5;

    return address;
  }
});
