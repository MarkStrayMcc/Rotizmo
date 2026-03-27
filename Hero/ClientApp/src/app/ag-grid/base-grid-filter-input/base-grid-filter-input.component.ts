import { Input, SimpleChanges, Directive } from '@angular/core';
import { GridApi, IFilterComp } from 'ag-grid';

@Directive()
export abstract class BaseGridFilterInputComponent {

    @Input() gridApi: GridApi;
    /**
     *  Column name this input is filtering against
     */
    @Input() column: string;

    public filterInstance: IFilterComp = null;

    protected callFilterWithText(text: string) {
        if (this.filterInstance) {
            this.filterInstance.setModel({
                type: "contains",
                filter: text
            });
            this.gridApi.onFilterChanged();
        }
    }

    protected callFilterWithNumber(number: number) {
        if (this.filterInstance) {
            this.filterInstance.setModel({
                type: "equals",
                filter: number
            });
            this.gridApi.onFilterChanged();
        }
    }

    public setUpGridApi(gridApi: GridApi) {
        this.gridApi = gridApi;
        if (this.column) {
           this.filterInstance = this.gridApi.getFilterInstance(this.column);
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (this.gridApi && this.column && (changes.column || changes.gridApi)) {
            this.filterInstance = this.gridApi.getFilterInstance(this.column);
        }
    }
}