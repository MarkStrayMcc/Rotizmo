import { Component, Input, OnInit, Output } from '@angular/core';
import { PropertyLimit } from '@app/quote/models/property-limit.model';

@Component({
    selector: 'app-property-limit-values',
    templateUrl: './property-limit-values.component.html',
    styleUrls: ['./property-limit-values.component.scss'],
})
export class PropertyLimitValuesComponent implements OnInit {
    @Input() propertyLimit: PropertyLimit = new PropertyLimit();

    constructor() { }

    ngOnInit(): void {}
}
