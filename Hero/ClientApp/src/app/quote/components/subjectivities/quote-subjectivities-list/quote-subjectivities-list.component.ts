import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { QuoteSubjectivity } from "@app/models";
import { Observable } from "rxjs";
import { QuoteSubjectivitiesHandlerService } from "@app/quote/components/subjectivities/quote-subjectivities-handler/quote-subjectivities-handler.service";

@Component({
    selector: "quote-subjectivities-list",
    templateUrl: "./quote-subjectivities-list.component.html",
    styleUrls: ["./quote-subjectivities-list.component.scss"]
})
export class QuoteSubjectivitiesListComponent implements OnInit, OnDestroy {
    @Input() public quoteSubjectivities: Observable<QuoteSubjectivity[]>;

    public ngOnInit(): void {}

    public ngOnDestroy(): void {}

    constructor(private readonly quoteSubjectivitiesHandlerService: QuoteSubjectivitiesHandlerService) {
    }

    public removeQuoteSubjectivityFromList(subjectivityIndex: number) {
        this.quoteSubjectivitiesHandlerService.removeQuoteSubjectivity(subjectivityIndex);
    }
}
