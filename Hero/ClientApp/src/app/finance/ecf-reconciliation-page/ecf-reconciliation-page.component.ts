import { Component } from '@angular/core';
import { FilterContextService } from "@app/finance/ecf-reconciliation/filter-context.service";

@Component({
    selector: 'ecf-reconciliation-page',
    templateUrl: './ecf-reconciliation-page.component.html',
    styleUrls: ['./ecf-reconciliation-page.component.scss'],
    providers: [FilterContextService]
})
export class EcfReconciliationPageComponent {
    constructor(private filterContextService: FilterContextService) {
    }
}