import { MaterialModule } from '@app/material/material.module';
import { BulkQuotingRoutingModule } from './bulk-quoting-routing.module';
import { NgModule } from '@angular/core';
import { BulkQuotingComponent } from './bulk-quoting.component';
import { UploadHistoryComponent } from './components/upload-history-grid/upload-history.component'
import { AgGridComponentsModule } from '@app/ag-grid/AgGridComponentsModule.module';
import { AgGridModule } from 'ag-grid-angular';
import { GridHeaderComponent } from '@app/ag-grid/grid-header/grid-header.component';
import { FileUploadComponent } from './components/file-upload/file-upload/file-upload.component';
import { FormCreatorModule } from "@app/shared/form-creator/form-creator.module";
import { SharedModule } from "@app/shared/shared.module";
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorModule } from '@app/shared/error.module';
import { RunDetailsComponent } from './components/run-details/run-details.component';
import { RouterLinkRendererComponent } from './components/upload-history-grid/router-link-renderer.component';

@NgModule({
  declarations: [
    BulkQuotingComponent,
    UploadHistoryComponent,
    FileUploadComponent,
    RunDetailsComponent,
    RouterLinkRendererComponent],
  imports: [
    MaterialModule,
    FormCreatorModule,
    BulkQuotingRoutingModule,
    SharedModule,
    ErrorModule,
    BrowserModule,
    FormsModule,
    AgGridComponentsModule,

      AgGridModule.withComponents([
        GridHeaderComponent,
        RouterLinkRendererComponent
    ]),
  ]
})
export class BulkQuotingModule { }
