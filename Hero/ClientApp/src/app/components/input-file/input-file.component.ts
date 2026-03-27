import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { ServerSideFileData, ServerSideFileType } from '@app/models';
import { Subject } from 'rxjs';
import { FileInput } from './file-input.model';


@Component({
    selector: "input-file",
    templateUrl: "./input-file.component.html",
    styleUrls: ["./input-file.component.scss"],
    providers: [
        { provide: MatFormFieldControl, useExisting: InputFileComponent }
    ]
})
export class InputFileComponent implements MatFormFieldControl<FileInput>, ControlValueAccessor, OnInit, OnDestroy {
    @Input()
    public formCtrl: AbstractControl;

    @Input()
    public fileTypes: string;

    @Input()
    public valuePlaceholder: string;

    @Input()
    public multiple: boolean;

    @Input()
    public defaultAttachments: ServerSideFileData[];

    @Input()
    public get value(): FileInput | null {
        return this.empty ? null : new FileInput(this._elementRef.nativeElement.value || []);
    }

    public set value(fileInput: FileInput | null) {
        this.writeValue(fileInput.files);
        this.stateChanges.next();
    }

    @Input()
    public get placeholder() {
        return this._placeholder;
    }

    public set placeholder(plh) {
        this._placeholder = plh;
        this.stateChanges.next();
    }

    @Input()
    public get required() {
        return this._required;
    }

    public set required(req: boolean) {
        this._required = coerceBooleanProperty(req);
        this.stateChanges.next();
    }

    @Input()
    public get disabled() {
        return this._disabled;
    }

    public set disabled(dis: boolean) {
        this._disabled = dis;
        this.stateChanges.next();
    }

    @Input()
    public get errorState() {
        return this.ngControl.errors !== null && this.ngControl.touched;
    }

    public get empty() {
        return !this._elementRef.nativeElement.value || this._elementRef.nativeElement.value.length === 0;
    }

    @HostBinding()
    public id = `input-file-${InputFileComponent.nextId++}`;

    @HostBinding('attr.aria-describedby')
    public describedBy = "";

    @HostBinding('class.file-input-disabled')
    public get isDisabled() {
        return this.disabled;
    }

    @HostBinding('class.mat-form-field-should-float')
    get shouldPlaceholderFloat() {
        return this.focused || !this.empty || this.valuePlaceholder !== undefined;
    }

    public shouldLabelFloat: boolean;
    public autofilled?: boolean;

    public static nextId = 0;

    public stateChanges = new Subject<void>();
    public focused = false;
    public controlType = 'file-input';

    private _placeholder: string;
    private _required = false;
    private _disabled: boolean = false;

    /**
     * @see https://angular.io/api/forms/ControlValueAccessor
     */
    constructor(public ngControl: NgControl,
        private fm: FocusMonitor,
        private _elementRef: ElementRef,
        private _renderer: Renderer2,
        private changeDetector: ChangeDetectorRef) {

        ngControl.valueAccessor = this;
        fm.monitor(_elementRef.nativeElement, true).subscribe(origin => {
            this.focused = !!origin;
            this.stateChanges.next();
        });
    }

    @HostListener('change', ['$event'])
    public change(event) {
        const fileList = event.target.files;
        const fileArray = [];
        if (fileList) {
            for (let i = 0; i < fileList.length; i++) {
                fileArray.push(fileList[i]);
            }
        }
        if (this.value && this.value.files && this.value.files.length > 0) {
            this.value = new FileInput(this.value.files.concat(fileArray));
        } else {
            this.value = new FileInput(fileArray);
        }

        this._onChange(this.value);
    }

    @HostListener('focusout')
    public blur() {
        this.focused = false;
        this._onTouched();
    }

    public setDescribedByIds(ids: string[]) {
        this.describedBy = ids.join(' ');
    }

    public onContainerClick(event: MouseEvent) {
        if ((event.target as Element).tagName.toLowerCase() !== "input" && !this.disabled) {
            this._elementRef.nativeElement.querySelector("input").focus();
            this.focused = true;
            this.open();
        }
    }

    private _onChange = (_: any) => { };
    private _onTouched = () => { };

    public writeValue(obj: any): void {
        this._renderer.setProperty(this._elementRef.nativeElement, 'value', obj);
    }

    public registerOnChange(fn: (_: any) => void): void {
        this._onChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this._onTouched = fn;
    }



    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public ngOnInit() {
        this.multiple = coerceBooleanProperty(this.multiple);
    }

    public open() {
        if (!this.disabled) {
            this._elementRef.nativeElement.querySelector('input').click();
        }
    }

    public get files() {
        return this.value ? this.value.fileNames.split(",") : [];
    }

    public get fileNames() {
        return this.value ? this.value.fileNames : this.valuePlaceholder;
    }

    public get serverSideFiles() {
        return this.defaultAttachments;
    }

    public fileRemove(index: number, event: MouseEvent) {
        let items = this.value.files;
        if (items) {
            items.splice(index, 1);
            this._onChange(this.value);
        }
        this.changeDetector.detectChanges();
        event.stopPropagation();
    }

    public removeDefault(index: number, event: MouseEvent) {
        let items = this.defaultAttachments;
        if (items && items[index].serverSideFileType !== ServerSideFileType.Quote) {
            items.splice(index, 1);
        }

        this.changeDetector.detectChanges();
        event.stopPropagation();
    }

    public fileNameFromPath(path: string) {
        return path.replace(/^.*[\\\/]/, '');
    }

    public ngOnDestroy() {
        this.stateChanges.complete();
        this.fm.stopMonitoring(this._elementRef.nativeElement);
    }
}
