import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { UploadHistoryComponent } from './upload-history.component';
import { AgGridComponentsModule } from '@app/ag-grid/AgGridComponentsModule.module';
import { AgGridModule } from 'ag-grid-angular';
import { GridHeaderComponent } from '@app/ag-grid/grid-header/grid-header.component';
import { BulkQuotingService } from '@app/bulk-quoting/services/bulk-quoting.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from "@app/services/config.service";
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RunDetail } from '@app/bulk-quoting/models/run-detail';

describe('UploadHistoryComponent', () => {

    let component: UploadHistoryComponent;
    let fixture: ComponentFixture<UploadHistoryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                BulkQuotingService,
                ConfigService,
                { provide: Router, useClass: class { navigate = jasmine.createSpy("navigate"); } },
            ],
            imports: [
                HttpClientTestingModule,
                AgGridComponentsModule,
                AgGridModule.withComponents([
                    GridHeaderComponent,
                ])
            ],
            declarations: [UploadHistoryComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UploadHistoryComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("grid API is not available until  `detectChanges`", () => {
        expect(component.gridOptions.api).not.toBeTruthy();
    });

    it('grid API is available after `detectChanges`', () => {
        fixture.detectChanges();
        expect(component.gridOptions.api).toBeTruthy();
    });

    it('should correctly initialise grid column defs on ngOnInit', () => {
        fixture.detectChanges();
        component.ngOnInit();

        expect(component.columnDefs.length).toBe(5);
    });

    it('should request upload history with correct pagination on datasource getrows', () => {
        // assemble
        const params = { startRow: 22, endRow: 23, sortModel: null, filterModel: null, context: null, successCallback: () => { }, failCallback: () => { } };

        const service = TestBed.inject(BulkQuotingService);
        const bulkUploadServiceSpy = spyOn(service, 'getUploadHistory').and.returnValue(of());

        fixture.detectChanges();

        //act
        component.dataSource.getRows(params);

        // assert
        expect(bulkUploadServiceSpy).toHaveBeenCalledWith(2,20);
    });

    it('setDisplayStatuses should correctly set displayStatus', () => {
        // assemble
        const runs = [
            {
                id: 1,
                status: 'inProgress',
                risks: [{riskStatus: 'quotesComplete'}, {riskStatus: 'inProgress'}]
            } as RunDetail,
            {
                id: 2,
                status: 'completed',
                risks: [{riskStatus: 'quotesComplete'}]
            } as RunDetail,
            {
                id: 3,
                status: 'completed',
                risks: [{riskStatus: 'error'}]
            } as RunDetail
        ];

        // act
        component.setDisplayStatuses(runs);

        // assert
        const run1 = runs.find(run => run.id === 1);
        expect(run1.displayStatus).toEqual('In Progress (1/2)');

        const run2 = runs.find(run => run.id === 2);
        expect(run2.displayStatus).toEqual('Completed');

        const run3 = runs.find(run => run.id === 3);
        expect(run3.displayStatus).toEqual('Completed (1 error)');
    });

});
