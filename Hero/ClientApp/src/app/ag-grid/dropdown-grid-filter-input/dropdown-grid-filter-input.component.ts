import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseGridFilterInputComponent } from '@app/ag-grid/base-grid-filter-input/base-grid-filter-input.component';

@Component({
    selector: 'dropdown-grid-filter-input',
    templateUrl: './dropdown-grid-filter-input.component.html',
    styleUrls: ['./dropdown-grid-filter-input.component.scss']
})
/** gridApi and column required to filter correctly*/
export class DropdownGridFilterInputComponent extends BaseGridFilterInputComponent {

    /**
     *  options for the select
     */
    @Input() options: Array<{ text: string, value: number }>;
    @Output() selectChanged: EventEmitter<any> = new EventEmitter();

    onSelectChange(event: { target: { value: any } }): void {
        if (event && event.target) {
            this.callFilterWithNumber(event.target.value);
            this.selectChanged.emit(event);
        }
    }
}