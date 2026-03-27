import { Injectable } from "@angular/core";
import { Subject} from "rxjs";

@Injectable()
export class AppCommunicationService {
    private className = new Subject<string>();

    public  className$ = this.className.asObservable();

    public addClass(className: string) {
        this.className.next(className);
    }

    public removeClass() {
        this.className.next("");
    }
}
