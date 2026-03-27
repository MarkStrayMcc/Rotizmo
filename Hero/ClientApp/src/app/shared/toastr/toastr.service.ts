import { BehaviorSubject, Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

export enum ToastType {
    Success = "success",
    Error = "error",
    Info = "info",
    Warning = "warning",
}

@Injectable({ providedIn: "root" })
export class ToastrService {
	private message: BehaviorSubject<string> = new BehaviorSubject<string>("");
	private toastType: BehaviorSubject<ToastType> = new BehaviorSubject(ToastType.Success);

	constructor() {}

	get message$(): Observable<string> {
		return this.message.asObservable();
	}

	get showToast$(): Observable<boolean> {
		return this.message$.pipe(map((message) => message !== ""));
	}

	set showToast(value: boolean) {
		if (!value) {
			this.message.next("");
		}
	}

	get toastType$(): Observable<ToastType> {
		return this.toastType.asObservable();
	}

	show(message: string, toastType: ToastType = ToastType.Success) {
		this.message.next(message);
		this.toastType.next(toastType);
	}
}
