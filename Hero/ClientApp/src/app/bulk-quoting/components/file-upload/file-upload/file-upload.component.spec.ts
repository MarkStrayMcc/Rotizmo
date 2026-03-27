import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from './file-upload.component';
import { BulkQuotingService } from '@app/bulk-quoting/services/bulk-quoting.service';
import { UserService } from '@app/services/user.service';
import { MessageComponent } from "@app/components/message/message.component";
import { ErrorModule } from '@app/shared/error.module';
import { AutocompleteDropdown } from '@app/components/autocomplete-dropdown';
import { MaterialModule } from '@app/material/material.module';
import { MatDialogModule } from '@angular/material';
import { MessageService } from '@app/services/message.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from '@app/services/config.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { from, Observable, of } from 'rxjs';
import { CfcContact, MessageResult } from '@app/models';

describe('FileUploadComponent', () => {
    let component: FileUploadComponent;
    let fixture: ComponentFixture<FileUploadComponent>;

    class MockUserService {
      public getUser() {
          const contact = new CfcContact();
          contact.cfcContactId = 123;
          contact.email = 'johndoe@test.com'
          return contact;
      }
    }
    
    beforeEach(async(() => {
    TestBed.configureTestingModule({
          declarations: [
            FileUploadComponent,
            AutocompleteDropdown,
            MessageComponent],
          imports: [
            HttpClientTestingModule,
            FormsModule,
            MatDialogModule,
            BrowserAnimationsModule,
            MaterialModule,
            ReactiveFormsModule, ErrorModule],
          providers: [
            { provide: UserService, useClass: MockUserService },
            MessageService,
            BulkQuotingService,
            NgForm,
            ConfigService
          ]
        }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(FileUploadComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should request user data from user service on submit', () => {
      // assemble
      const service = TestBed.inject(UserService);
      const bulkUploadServiceSpy = spyOn(service, 'getUser').and.returnValue(of());

      // form setup
      component.uploadBulkQuoteForm.patchValue({
        brokerCompany: 'xyz ltd'
      });

      fixture.detectChanges();

      //act
      component.onSubmit();

      // assert
      expect(bulkUploadServiceSpy).toHaveBeenCalled();
    });

    it('should submit form data on submit', () => {
      // assemble
      const service = TestBed.inject(BulkQuotingService);
      const bulkUploadServiceSpy = spyOn(service, 'uploadBulkQuotes').and.returnValue(of());

      // form setup
      component.uploadBulkQuoteForm.patchValue({
        brokerCompany: 'xyz ltd',
        emailQuoteSummaries: true,
        bulkQuotesFile: '',      
      });

      fixture.detectChanges();

      //act
      component.onSubmit();

      // assert
      expect(bulkUploadServiceSpy).toHaveBeenCalled();
    });

    it("should call handleError when uploadBulkQuotes returns an error", fakeAsync(inject([MessageService],
       (messageHandlerService: MessageService) => {

      // assemble  
      let bulkUploadServiceSpy: jasmine.Spy;
      const service = TestBed.inject(BulkQuotingService);

      bulkUploadServiceSpy = spyOn(service, 'uploadBulkQuotes').and.returnValue(from([new MessageResult()]));
      bulkUploadServiceSpy.and.returnValue(new Observable(subscriber => subscriber.error({ error: {detail: 'test'} })));

      const handleErrorSpy = spyOn(messageHandlerService, "sendMessage");

      // form setup
      component.uploadBulkQuoteForm.patchValue({
        brokerCompany: 'xyz ltd',
        emailQuoteSummaries: true,
        bulkQuotesFile: '',      
      });

      fixture.detectChanges();

      // act
      component.onSubmit();
      tick(500);
      // assert
 
      fixture.whenStable().then(() => {
        expect(handleErrorSpy).toHaveBeenCalled();
      })
    })));

    it('should set form file when onFileChange called', () => {

      // assemble
      const mockFile = new File([''], 'filename', { type: 'text/html' });
      const mockEvt = { target: { files: [mockFile] } };
  
      // act
      component.onFileChange(mockEvt as any);
  
      // assert
      let name = component.uploadBulkQuoteForm.controls['bulkQuotesFile'];
      expect(name.value).toEqual(mockFile);
    });

});

