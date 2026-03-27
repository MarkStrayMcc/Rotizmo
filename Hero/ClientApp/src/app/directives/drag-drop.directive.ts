import { Directive, EventEmitter, HostListener, Output } from "@angular/core";

@Directive({
	selector: "[appDnd]",
})
export class DndDirective {
	@Output() fileDropped = new EventEmitter<any>();

	// Dragover listener
	@HostListener("dragover", ["$event"]) onDragOver(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	// Dragleave listener
	@HostListener("dragleave", ["$event"]) public onDragLeave(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	// Drop listener
	@HostListener("drop", ["$event"]) public ondrop(event) {
		event.preventDefault();
		event.stopPropagation();
		let files = event.dataTransfer.files;
		if (files.length > 0) {
			this.fileDropped.emit(files);
		}
	}
}
