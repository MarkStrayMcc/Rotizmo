import { Component, OnInit, OnDestroy } from "@angular/core";
import { AppCommunicationService } from "@app/services/app-communication.service";
import { Title } from "@angular/platform-browser";
import { OutstandingFundsGridDataHandlerService } from "@app/services/finance/outstanding-funds/outstanding-funds-grid-data-handler.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
    selector: "finance-outstanding-funds",
    templateUrl: "./outstanding-funds.component.html",
    styleUrls: ["./outstanding-funds.component.scss"]
})
export class OutstandingFundsComponent implements OnInit, OnDestroy {

    private readonly ngUnsubscribe = new Subject<null>();
    public displayErrorMessage = false;
    constructor(private readonly appCommunicationService: AppCommunicationService,
                private readonly titleService: Title,
                private readonly outstandingFundsGridDataHandlerService: OutstandingFundsGridDataHandlerService) {
        this.appCommunicationService.addClass("wide");
        this.titleService.setTitle("Outstanding Funds");
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ngOnInit() {
        this.outstandingFundsGridDataHandlerService
            .displayErrorMessage$
            .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((displayorNot: boolean) => {
            this.displayErrorMessage = displayorNot;
        });
    }

}
