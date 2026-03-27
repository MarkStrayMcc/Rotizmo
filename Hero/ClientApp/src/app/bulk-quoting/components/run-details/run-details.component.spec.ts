import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AgGridModule } from 'ag-grid-angular';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AgGridComponentsModule } from '@app/ag-grid/AgGridComponentsModule.module';
import { RunDetailsComponent } from './run-details.component';
import { GridHeaderComponent } from '@app/ag-grid/grid-header/grid-header.component';
import { BulkQuotingService } from '@app/bulk-quoting/services/bulk-quoting.service';
import { ConfigService } from '@app/services/config.service';
import { RunDetail, RunRisk } from '@app/bulk-quoting/models/run-detail';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RunDetailsComponent', () => {
    let component: RunDetailsComponent;
    let fixture: ComponentFixture<RunDetailsComponent>;
    let repId = 10;

    const mockRoute = {
    paramMap: of({
        get: (_) => repId,
        has: (_) => repId !== null
    }),
    queryParamMap: {},
    snapshot: {}
  };

    beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [RunDetailsComponent],
        schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
        providers: [
            BulkQuotingService,
            ConfigService,
            { provide: ActivatedRoute, useValue: mockRoute }
        ],
        imports: [
            HttpClientTestingModule,
            AgGridComponentsModule,
            AgGridModule.withComponents([
                GridHeaderComponent,
            ])
        ],
    }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RunDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('grid API is available after `detectChanges`', () => {
        fixture.detectChanges();
        expect(component.gridOptions.api).toBeTruthy();
    });

    it('should correctly initialise grid column defs on ngOnInit', () => {
        component.ngOnInit();
        expect(component.columnDefs.length).toBe(5);
    });

    it('should request risk data with correct identifier from active route', () => {
        // assemble
        const params = {
                startRow: 1, endRow: 20, sortModel: null,
                filterModel: null, context: null,
                successCallback: () => { },
                failCallback: () => { }
            };

        const service = TestBed.inject(BulkQuotingService);
        const bulkUploadServiceSpy = spyOn(service, 'getRunDetails').and.returnValue(of());

        //act
        component.dataSource.getRows(params);

        // assert
        expect(bulkUploadServiceSpy).toHaveBeenCalledWith(10);
    });
  
    it('should not request risk data from service after initial grid population', () => {
        // assemble
        const params = {
                startRow: 1, endRow: 20, sortModel: null,
                filterModel: null, context: null,
                successCallback: () => { },
                failCallback: () => { }
            };

        const service = TestBed.inject(BulkQuotingService);
        const bulkUploadServiceSpy = spyOn(service, 'getRunDetails').and.returnValue(of());

        let mockData = {status: 'inProgress'} as RunDetail;
        mockData.risks = [{riskStatus: 'inProgress', emailStatus: 'notSent'} as RunRisk];

        component.runDetail = mockData;
        //act
        component.dataSource.getRows(params);

        // assert
        expect(bulkUploadServiceSpy).not.toHaveBeenCalledWith(10);
    });

    it('setDisplayStatuses should set diplay statuses correctly', () => {
        // assemble
        let run = {
            status: 'inProgress',
            risks: [
            {externalReference: '1', riskStatus: 'inProgress', emailStatus: 'sent'},
            {externalReference: '2', riskStatus: 'quotesComplete', emailStatus: 'sent'},
            {externalReference: '3', riskStatus: 'quotesComplete', emailStatus: 'sent'},
            {externalReference: '4', riskStatus: 'quotesComplete', emailStatus: 'notSent'},
        ]
        } as RunDetail;

        // act
        component.setDisplayStatuses(run);

        // assert
        expect(run.displayStatus).toEqual('In Progress');
        expect(run.risks.find(r => r.externalReference === '1').displayStatus).toEqual('In Progress');
        expect(run.risks.find(r => r.externalReference === '2').displayStatus).toEqual('Completed');
        expect(run.risks.find(r => r.externalReference === '3').emailStatus).toEqual('Sent');
        expect(run.risks.find(r => r.externalReference === '4').emailStatus).toEqual('Not Sent');
    });

});
