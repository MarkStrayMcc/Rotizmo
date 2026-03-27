import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PropertyLimitFloatingValues } from '@app/quote/models/property-limit-floating-values.model';

@Component({
    selector: 'app-blast-zone-floating-values',
    templateUrl: './blast-zone-floating-values.component.html',
    styleUrls: ['./blast-zone-floating-values.component.scss']
})
export class BlastZoneFloatingValuesComponent implements OnInit {
    @Input() firstLossLimit: number | null = null;
    @Input() floatingValues:PropertyLimitFloatingValues = new PropertyLimitFloatingValues();
    @Output() firstLossLimitChange : EventEmitter<number> = new EventEmitter<number>();
    @Output() floatingValuesChange : EventEmitter<void> = new EventEmitter<void>();

    @Input() hasWarning: boolean = false;
    @Input() warningMessage: string = "First Loss Limit Value cannot exceed £300 million";
    constructor() { }

    ngOnInit(): void {
    }

    onFirstLimitChange(event:number){
        this.firstLossLimitChange.emit(event);
    }

    onFloatingValueChange(){
        this.floatingValuesChange.emit();
    }
}
