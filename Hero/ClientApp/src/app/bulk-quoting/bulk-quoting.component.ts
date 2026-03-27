import { Component, OnInit, ViewChild } from '@angular/core';
import { UploadHistoryComponent } from './components/upload-history-grid/upload-history.component';

@Component({
  selector: 'app-bulk-quoting',
  templateUrl: './bulk-quoting.component.html',
  styleUrls: ['./bulk-quoting.component.scss']
})
export class BulkQuotingComponent implements OnInit {

  @ViewChild(UploadHistoryComponent)
  private uploadHistory: UploadHistoryComponent;

  constructor() { }

    ngOnInit() {
    }

  fileUploadSuccess(event: any) {
    this.uploadHistory.refreshGrid();
  }

}
