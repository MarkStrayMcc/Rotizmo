import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { TextGridFilterInputComponent } from './text-grid-filter-input.component';
import { IFilterComp, GridApi, TextFilter } from 'ag-grid';
import { SimpleChange } from '@angular/core';

let component: TextGridFilterInputComponent;
let fixture: ComponentFixture<TextGridFilterInputComponent>;

describe('textGridFilterInput component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ TextGridFilterInputComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                GridApi
            ]
        });
        fixture = TestBed.createComponent(TextGridFilterInputComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));

    it('should set the column filter instance on ng changes', async(() => {
        // arrange
        component.column = "test";
        component.gridApi = new GridApi();
        
        let gridApiSpy = spyOn(component.gridApi, "getFilterInstance").and.returnValue({});

        // act
        component.ngOnChanges({
            column: new SimpleChange(null, "test", true)
        });

        // assert
        expect(gridApiSpy).toHaveBeenCalled();

        expect(component.filterInstance).not.toBe(null);
    }));

    it('Should set the column filter instance on setting api via method', async(() => {
        // arrange
        component.column = "test";
        let grid = new GridApi();
        let gridApiSpy = spyOn(grid, "getFilterInstance").and.returnValue({});

        // act
        component.setUpGridApi(grid);

        // assert
        expect(gridApiSpy).toHaveBeenCalled();
        expect(component.filterInstance).not.toBe(null);
        expect(component.gridApi).not.toBe(null);
    }));

    it('should call grid api on keyup', async(() => {
        // arrange
        component.column = "test";
        component.gridApi = new GridApi();
        component.filterInstance = new TextFilter();
        let setModelSpy = spyOn(component.filterInstance, "setModel").and.callFake(() => { });
        let gridApiSpy = spyOn(component.gridApi, "onFilterChanged").and.callFake(() => { });

        // act
        component.onKeyUp({
            target: {
                value: "test"
            }
        });

        // assert
        expect(setModelSpy).toHaveBeenCalledWith({
            type: "contains",
            filter: "test"
        });
        expect(gridApiSpy).toHaveBeenCalled();
    }));
});