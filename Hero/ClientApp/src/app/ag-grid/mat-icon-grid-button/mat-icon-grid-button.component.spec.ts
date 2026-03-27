import { async, ComponentFixture, TestBed, ComponentFixtureAutoDetect } from "@angular/core/testing";

import { MatIconGridButtonComponent } from "./mat-icon-grid-button.component";
import { BrowserModule } from "@angular/platform-browser";
import { ICellRendererParams } from "ag-grid";

describe("MatIconGridButtonComponent", () => {
    let component: MatIconGridButtonComponent;
    let fixture: ComponentFixture<MatIconGridButtonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MatIconGridButtonComponent],
            imports: [BrowserModule],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(MatIconGridButtonComponent);
        component = fixture.componentInstance;
    }));

    const mockClickCallback = (data: any): void => {
        data.called = true;
    };

    const mockIsDisabled = (data: any): boolean => {
        return data.isDisabled;
    };

    /***
     * mock a cell renderer param
     *
     */

    beforeEach(() => {
        fixture = TestBed.createComponent(MatIconGridButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should get params, where text is delete and button is enabled", async(() => {
        const isDisabledParam = {
            isDisabled: false
        };
        const mockCellRendererParams: ICellRendererParams = {
            value: null,
            valueFormatted: null,
            getValue: () => null,
            setValue: null,
            formatValue: null,
            data: {
                mockRecordId: 2
            },
            node: null,
            colDef: {
                field: "someGridId",
                headerName: "Delete",
                headerTooltip: "Delete",
                cellRendererFramework: MatIconGridButtonComponent,
                cellRendererParams: {
                    matIconText: "delete",
                    tooltip: "Delete",
                    clickCallback: mockClickCallback({ called: false }),
                    isDisabled: () => mockIsDisabled(isDisabledParam)
                },
                width: 55,
                suppressMenu: true,
                suppressSorting: true
            },
            column: null,
            $scope: null,
            rowIndex: 1,
            api: null,
            context: null,
            columnApi: null,
            refreshCell: null,
            eGridCell: null,
            eParentOfValue: null,
            addRenderedRowListener: null
        };

        component.agInit(mockCellRendererParams);
        expect(component.matIconText).toEqual("delete");
        expect(component.tooltip).toEqual("Delete");
        expect(component.disabled).toBeFalsy();
    }));

    it("should get params, where text is reverse and button is disabled", async(() => {
        const isDisabledParam = {
            isDisabled: true
        };
        const mockCellRendererParams: ICellRendererParams = {
            value: null,
            valueFormatted: null,
            getValue: () => null,
            setValue: null,
            formatValue: null,
            data: {
                mockRecordId: 2
            },
            node: null,
            colDef: {
                field: "someGridId",
                headerName: "reverse",
                headerTooltip: "reverse",
                cellRendererFramework: MatIconGridButtonComponent,
                cellRendererParams: {
                    matIconText: "reverse",
                    tooltip: "reverse",
                    clickCallback: mockClickCallback({ called: false }),
                    isDisabled: () => mockIsDisabled(isDisabledParam)
                },
                width: 55,
                suppressMenu: true,
                suppressSorting: true
            },
            column: null,
            $scope: null,
            rowIndex: 1,
            api: null,
            context: null,
            columnApi: null,
            refreshCell: null,
            eGridCell: null,
            eParentOfValue: null,
            addRenderedRowListener: null
        };

        component.agInit(mockCellRendererParams);
        expect(component.matIconText).toEqual("reverse");
        expect(component.tooltip).toEqual("reverse");
        expect(component.disabled).toBeTruthy();
    }));
});
