import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MtaType } from "@app/policy/models/MtaType";
import { Policy } from "@app/models/auto-generated/Policy";

@Component({
    selector: 'policy-mta-type-menu',
    templateUrl: './mta-type-menu.component.html',
    styleUrls: ['./mta-type-menu.component.scss']
})
export class MtaTypeMenuComponent {

    @Input() 
    public menuItems: MtaType[];
    
    @Input() 
    public get policy(): Policy{
        return this._policy;
    }

    public set policy(value: Policy){
        this._policy = value;
    }

    @Output() 
    private menuClicked = new EventEmitter();

    private _policy: Policy;

    constructor() { }

    public onClick(mtaType: string) {
        this.menuClicked.emit({ policy: this.policy, mtaType: mtaType });
    }
}
