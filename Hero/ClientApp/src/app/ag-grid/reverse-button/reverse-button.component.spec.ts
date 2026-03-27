/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { ICellRendererParams } from 'ag-grid';
import { ReverseButtonComponent } from '@app/ag-grid/reverse-button/reverse-button.component';

let component: ReverseButtonComponent;
let fixture: ComponentFixture<ReverseButtonComponent>;

describe('grid-icon-button component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ReverseButtonComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
        fixture = TestBed.createComponent(ReverseButtonComponent);
        component = fixture.componentInstance;
    }));
    let params: ICellRendererParams = {
        value: 1,
        valueFormatted: "1",
        getValue: () => 1,
        setValue: null,
        formatValue: null,
        data: {
            reverseFinancialTransactionId: 2
        },
        node: null,
        colDef: null,
        column: null,
        $scope: null,
        rowIndex: 1,
        api: null,
        columnApi: null,
        context: {
            matIconText: "hello",
            reverseTooltip: "tip"
        },
        refreshCell: null,
        eGridCell: null,
        eParentOfValue: null,
        addRenderedRowListener: null
    };

    it('set values on init based on context values', async(() => {
        // assemble
        // act
        component.agInit(params);
        // assert
        expect(component.tooltip).toBe("tip");
        expect(component.matIconText).toBe("hello");
    }));

    it('disables if reverse transaction id set', async(() => {
        // assemble
        params.data.reverseFinancialTransactionId = 2;
        params.data.transferredToOffice = undefined;
        params.data.financialTransactionId = 4;

        // act
        component.agInit(params);
        // assert
        expect(component.enabled).toBeFalsy();
    }));

    it('enables if reverse transaction id and transferred to office not set', async(() => {
        // assemble
        params.data.reverseFinancialTransactionId = undefined;
        params.data.transferredToOffice = undefined;
        params.data.financialTransactionId = 4;

        // act
        component.agInit(params);
        // assert
        expect(component.enabled).toBeTruthy();
    }));

    it('disables if transferred to office set', async(() => {
        // assemble
        params.data.transferredToOffice = 1;
        params.data.reverseFinancialTransactionId = undefined;
        params.data.financialTransactionId = 4;

        // act
        component.agInit(params);
        // assert
        expect(component.enabled).toBeFalsy();
    }));
});
