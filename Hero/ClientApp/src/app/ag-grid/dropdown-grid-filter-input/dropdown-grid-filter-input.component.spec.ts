/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserModule, By } from "@angular/platform-browser";
import { DropdownGridFilterInputComponent } from './dropdown-grid-filter-input.component';
import { GridApi, TextFilter } from 'ag-grid';

let component: DropdownGridFilterInputComponent;
let fixture: ComponentFixture<DropdownGridFilterInputComponent>;

describe('dropdownGridFilterInput component', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ DropdownGridFilterInputComponent ],
            imports: [ BrowserModule ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true }
            ]
        });
        fixture = TestBed.createComponent(DropdownGridFilterInputComponent);
        component = fixture.componentInstance;
    }));

    it('should do something', async(() => {
        expect(true).toEqual(true);
    }));

    it('should call grid api on change', async(() => {
        // arrange
        component.column = "test";
        component.gridApi = new GridApi();
        component.filterInstance = new TextFilter();
        let setModelSpy = spyOn(component.filterInstance, "setModel").and.callFake(() => { });
        let gridApiSpy = spyOn(component.gridApi, "onFilterChanged").and.callFake(() => { });

        // act
        component.onSelectChange({
            target: {
                value: 3
            }
        });

        // assert
        expect(setModelSpy).toHaveBeenCalledWith({
            type: "equals",
            filter: 3
        });
        expect(gridApiSpy).toHaveBeenCalled();
    }));
});