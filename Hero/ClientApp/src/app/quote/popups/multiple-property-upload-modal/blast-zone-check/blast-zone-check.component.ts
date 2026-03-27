import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { InvalidBlastZoneChecks } from '@app/models/invalid-blast-zone-checks';

@Component({
    selector: 'app-blast-zone-check',
    templateUrl: './blast-zone-check.component.html',
    styleUrls: ['./blast-zone-check.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class BlastZoneCheckComponent implements OnInit {
    @Input() invalidBlastZoneChecks: InvalidBlastZoneChecks[] = [];
    @Input() validBlastZoneCheckResultCount: number = 0;

    constructor() { }

    ngOnInit(): void {}
}
