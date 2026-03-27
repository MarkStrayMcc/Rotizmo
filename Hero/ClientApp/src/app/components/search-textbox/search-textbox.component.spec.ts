import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { SearchTextBoxComponent } from './search-textbox.component';
import { MaterialModule } from '@app/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SearchTextBoxComponent', () => {
    let component: SearchTextBoxComponent;
    let fixture: ComponentFixture<SearchTextBoxComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
        declarations: [SearchTextBoxComponent],
        imports: [MaterialModule,BrowserAnimationsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
      fixture = TestBed.createComponent(SearchTextBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create SearchTextBoxComponent', () => {
    expect(component).toBeTruthy();
  });
});
