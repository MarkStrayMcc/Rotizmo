import { Component, Input, Output } from "@angular/core";
import { FormGroup } from '@angular/forms';
import { FormButton, FormConfig } from "@app/shared/form-creator/form-creator.config";
import { EventEmitter } from '@angular/core';

@Component({
    selector: "shared-two-columns-template",
    templateUrl: "./two-columns-template.component.html"
})
export class TwoColumnsTemplateComponent {

    @Input()
    item: any = {};

    @Input()
    config: FormConfig = new FormConfig();

    @Input()
    form: FormGroup;

    @Output()
    buttonClicked: EventEmitter<any> = new EventEmitter();

    public buttonConfig: FormButton[];

    constructor() { }

    public getSelectedItem(field) {
        return this.item[field.property];
    }

    public isButtonDisabled(button) {
        const isDisabled = this.buttonConfig ?
            this.buttonConfig.filter(singleButton => singleButton.property === button.property)[0].disable :
            this.config.buttons.filter(singleButton => singleButton.property === button.property)[0].disable;
        return isDisabled;
    }

    public clicked(button) {
        this.buttonClicked.emit(button);
    }
}
