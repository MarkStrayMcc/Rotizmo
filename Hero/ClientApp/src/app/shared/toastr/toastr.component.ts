import { Component, OnInit } from "@angular/core";
import { ToastType, ToastrService } from "./toastr.service";
import { Observable } from "rxjs";

@Component({
	selector: "toastr",
	templateUrl: "toastr.component.html",
	styleUrls: ["toastr.component.scss"],
})
export class ToastrComponent implements OnInit {
	message$: Observable<string> = this._toastrService.message$;
	toastType$: Observable<ToastType> = this._toastrService.toastType$;
	constructor(private _toastrService: ToastrService) {}

	ngOnInit() {
		setTimeout(() => {
			this._toastrService.showToast = false;
		}, 3000);
	}
}
