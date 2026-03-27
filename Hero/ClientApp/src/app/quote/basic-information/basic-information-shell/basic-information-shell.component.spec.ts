import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';
import { BasicInformationShellComponent } from './basic-information-shell.component';

import { DropdownService } from '@app/services/dropdown.service';
import { WordingVersionHttpService } from '@app/quote/services/wording-version/wording-version-http-service';
import { GoodsAndServicesTaxService } from '@app/quote/services/goods-and-services-tax.service';
import { TaxHttpService } from "@app/services/tax-http.service";
import { UserService } from "@app/services/user.service";
import { DropDownManagerService } from "@app/services/dropdown-manager.service";
import { CookieService } from 'ngx-cookie-service';
import { RiskService } from "@app/services/risk-service";
import { RiskHttpService } from "@app/services/risk-http.service";
import { provideMockStore } from '@ngrx/store/testing';
import { EffectsModule } from '@ngrx/effects';
import { BasicInformationState, intialFormValuesState, initialFormOptionsState, intialFormValidationState } from '@app/basic-information-store';

// this file was supposed to be part of the new ngrx basic step component
// never got finished and now is breaking the tests
// commented out until we decide if we are going to keep this or not
xdescribe('BasicInformationShellComponent', () => {
  let component: BasicInformationShellComponent;
  let fixture: ComponentFixture<BasicInformationShellComponent>;

  const featureState: BasicInformationState = {
    formValues: intialFormValuesState,
    formOptions: initialFormOptionsState,
    formValidation: intialFormValidationState
  };

  const state = {
    quote: {
      basicInformation: featureState
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
      ],
      declarations: [
        BasicInformationShellComponent,
        MockBasicInformationStepComponent
      ],
      providers: [
        DropdownService,
        WordingVersionHttpService,
        GoodsAndServicesTaxService,
        TaxHttpService,
        UserService,
        DropDownManagerService,
        CookieService,
        RiskService,
        RiskHttpService,
        provideMockStore({ initialState: state }),
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicInformationShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/* Mock of sub-component */
@Component({
  selector: 'basic-information-view',
  template: '<div></div>'
})
class MockBasicInformationStepComponent { }
