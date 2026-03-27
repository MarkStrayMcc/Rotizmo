import { Component, ElementRef } from '@angular/core';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid';

@Component({
    selector: 'grid-header',
    templateUrl: './grid-header.component.html',
    styleUrls: ['./grid-header.component.scss']
})
/** grid-header component*/
export class GridHeaderComponent implements IHeaderAngularComp {
    public params: IHeaderParams;
    public sorted: string;
    private elementRef: ElementRef;
    public filterActive: boolean = false;

    agInit(params: IHeaderParams): void {
        this.params = params;
        this.params.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
        this.params.column.addEventListener("filterChanged", this.onFilterChanged.bind(this));
        this.onSortChanged();
    }
    /** grid-header ctor */
    constructor(elementRef: ElementRef) {
        this.elementRef = elementRef;
    }

    onMenuClick() {
        this.params.showColumnMenu(this.querySelector('.filter-wrap'));
    }

    private querySelector(selector: string) {
        return <HTMLElement>this.elementRef.nativeElement.querySelector(
            '.filter-wrap', selector);
    }

    getSortMatIcon(order: string) : string {
        if (order === "asc") {
            return "arrow_upward";
        }
        if (order === "desc") {
            return "arrow_downward";
        }
        // no order
        return "swap_vert";
    }

    onSortRequested(order, event) {
        // so that we change to the next in line of sorts
        switch (order) {
            case "asc":
                order = "desc";
                break;
            case "desc":
                order = "";
                break;
            case "":
                order = "asc";
                break;
        }

        this.params.setSort(order, event.shiftKey);
    };

    private onFilterChanged() {
        this.filterActive = this.params.column.isFilterActive();
    }

    private onSortChanged() {
        if (this.params.column.isSortAscending()) {
            this.sorted = 'asc'
        } else if (this.params.column.isSortDescending()) {
            this.sorted = 'desc'
        } else {
            this.sorted = ''
        }
    };
}