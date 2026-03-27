import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder, NgForm } from '@angular/forms';
import { map, takeUntil } from 'rxjs/operators';

import { DropDownItem, Message, MessageType } from '@app/models';
import { BulkQuotingService } from '@app/bulk-quoting/services/bulk-quoting.service';
import { AutocompleteSelectedValidator } from '@app/validators/autocomplete-selected.validator';
import { UserService } from '@app/services/user.service';
import { ErrorMessageHandlerService } from '@app/services/error-message-handler.service';
import { MessageService } from '@app/services/message.service';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  @ViewChild('formDirective') uploadForm: NgForm;
  @ViewChild('fileUploader') fileUploader: ElementRef;

  @Output() fileUploadSuccess = new EventEmitter<any>();

    private ngUnsubscribe: Subject<any> = new Subject();
    public brokersObservable: Observable<DropDownItem[]>;

    public uploadBulkQuoteForm: FormGroup;
    public isReadOnly: boolean = false;
    public displayErrorMessage: boolean = false;
    public validFileTypes: string;
    public allowMultiple: any = null;
    public isExecuting: boolean = false;

    constructor(

      private fb: FormBuilder,
      private readonly userService: UserService,
      private messageService: MessageService,
      private bulkQuotingService: BulkQuotingService) { }

    ngOnInit() {

      this.initializeFormControls();
      this.initializeLookups();
    }

    ngOnDestroy() {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }

    private initializeLookups() {
      this.bulkQuotingService.getBrokers()
      .pipe(takeUntil(this.ngUnsubscribe),map(res => {
        const data = res.map(obj => (new DropDownItem(obj, obj, '', '')));
        return data;
      }))
      .subscribe(data => {
        this.brokersObservable = of(data);
      });
    }

    protected handleSendSuccess(data: any): void {

      this.isExecuting = false;
      this.displayErrorMessage = false;

      this.uploadBulkQuoteForm.reset(this.defaultFormValues);
      this.uploadForm.resetForm(this.defaultFormValues);

      //Manually reset file input..resetForm doesn't reset it
      this.fileUploader.nativeElement.value = null;
      this.fileUploadSuccess.emit();
  }

    protected handleSendError(errorState: any): void {

        const message = this.constructErrorMessage(errorState);
      
        this.isExecuting = false;
        this.displayErrorMessage = true;
 
        setTimeout(() => {
            this.messageService.sendMessage(message);
        }, 0);
    }

    private constructErrorMessage(errorState: any): Message {
      const message = new Message();
      message.type = MessageType.Error;

      message.messageList = errorState.error === null ? null : errorState.error.detail.split('\r\n');

      if (message.messageList != null && message.messageList.length === 1) {
          message.text = message.messageList[0];
      } else if (message.messageList != null && message.messageList.length > 1) {
          message.messageList = message.messageList;
      } else {
          message.text = "An error occurred whilst uploading your file. Please contact IT Support.";
      }

      return message;
    }

    private defaultFormValues: any = {
      emailQuoteSummaries: false
    };

    private initializeFormControls(): void {

        this.validFileTypes = ".xlsx";
        this.uploadBulkQuoteForm = this.fb.group({

        brokerCompany: [
        {
            value: null,
            disabled: this.isReadOnly
        }, [Validators.required, AutocompleteSelectedValidator]
        ],

        bulkQuotesFile: [
        {
            value: null,
            disabled: this.isReadOnly
        }, [Validators.required]
        ],

        emailQuoteSummaries: [
        { 
            value: this.defaultFormValues.emailQuoteSummaries,
            disabled: this.isReadOnly }
        ],
        });
    }

    onSubmit() {

        this.isExecuting = true;

        const user = this.userService.getUser();
        const formData = new FormData();

        formData.append('file', this.uploadBulkQuoteForm.get('bulkQuotesFile').value);
        formData.append('brokerCompany', (this.uploadBulkQuoteForm.controls.brokerCompany.value as DropDownItem).value);
        formData.append('sendEmails', this.uploadBulkQuoteForm.get('emailQuoteSummaries').value);
        formData.append('underwriterEmail', user.email);

        this.bulkQuotingService.uploadBulkQuotes(formData).pipe(
        takeUntil(this.ngUnsubscribe))
        .subscribe(
            () => this.handleSendSuccess(''),
            errorState => this.handleSendError(errorState));
    }

    onFileChange(event) {

        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            this.uploadBulkQuoteForm.get('bulkQuotesFile').setValue(file, {emitModelToViewChange: false});
        }
    }

}