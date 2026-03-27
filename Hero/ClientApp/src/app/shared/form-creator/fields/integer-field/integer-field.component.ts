import { Component, Input } from "@angular/core";
import { IntegerField } from "@app/shared/form-creator/form-creator.config";
import { FormGroup } from "@angular/forms";

const ignoredKeys = {
  "Escape": 27,
  "Tab": 9,
  "CapsLock": 20,
  "Shift": 16,
  "Control": 17,
  "Alt": 18,
  "Backspace": 8,
  "Enter": 13,
  "ContextMenu": 93,
  "AltGraph": 225,
  "ArrowLeft": 37,
  "ArrowDown": 40,
  "ArrowRight": 39,
  "ArrowUp": 38,
  "Insert": 45,
  "Delete": 46,
  "End": 35,
  "PageDown": 34,
  "PageUp": 33,
  "Home": 36
};

@Component({
  selector: "app-integer-field",
  templateUrl: "./integer-field.component.html"
})
export class IntegerFieldComponent {

  @Input()
  formGroup: FormGroup;

  @Input()
  config: IntegerField;

  @Input()
  item: any;

  onKeyDown(event) {
    // todo:  refactor this bit using the NumberOnly directive we already have in HERO
    if (this.isIgnoredKey(event) ||
        this.isNumber(this.getKeyFromEvent(event))) {
      event["validKey"] = true;
      return true;
    }

    return false;
  }

  getKeyFromEvent(ev) {
    const charCode = ev.which || ev.keyCode;
    return ev.key ? ev.key : String.fromCharCode(charCode);
  }

  isNumber(value) {
    return !isNaN(parseInt(value, 10)) && isFinite(value);
  }

  isIgnoredKey(ev) {
    return (Object.values(ignoredKeys).indexOf(ev.keyCode) !== -1 ||
            Object.keys(ignoredKeys).indexOf(ev.key) !== -1);
  }

}
