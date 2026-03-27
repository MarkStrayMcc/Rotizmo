import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PropertyLimitValuesComponent } from './property-limit-values.component';
import { CurrencyComponent } from '@app/components/currency/currency.component';

describe('PropertyLimitValuesComponent', () => {
  let component: PropertyLimitValuesComponent;
  let fixture: ComponentFixture<PropertyLimitValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyLimitValuesComponent, CurrencyComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [ FormBuilder ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyLimitValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
