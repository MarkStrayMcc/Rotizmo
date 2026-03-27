import { Component } from '@angular/core';
import { BaseGridFilterInputComponent } from '@app/ag-grid/base-grid-filter-input/base-grid-filter-input.component';

@Component({
    selector: 'text-grid-filter-input',
    templateUrl: './text-grid-filter-input.component.html',
    styleUrls: ['./text-grid-filter-input.component.scss']
})
/** textGridFilterInput component*/
export class TextGridFilterInputComponent extends BaseGridFilterInputComponent {
    public onKeyUp(event: { target: { value: any }}) {
        if (event && event.target) {
            this.callFilterWithText(event.target.value);
        }
    }
}