import { Component, Input, OnInit } from '@angular/core';
import { TemplateUploadResult } from '@app/models/template-upload-result';

@Component({
    selector: 'app-location-validation-results',
    templateUrl: './location-validation-results.component.html',
    styleUrls: ['./location-validation-results.component.scss']
})
export class LocationValidationResultsComponent implements OnInit {

    @Input() public uploadResult: TemplateUploadResult;

    constructor() { }

    ngOnInit(): void {
    }

}
