import { Component, EventEmitter, Input, Output } from "@angular/core";
import { QuoteSubjectivity } from "@app/models";
import { QuoteSubjectivityService } from "@app/services/quote-subjectivity.service";

@Component({
    selector: "quote-subjectivity",
    templateUrl: "./quote-subjectivity.component.html",
    styleUrls: ["./quote-subjectivity.component.scss"]
})
export class QuoteSubjectivityComponent {
    @Input() public quoteSubjectivity: QuoteSubjectivity;
    @Input() public readOnly: boolean = false;
    
    @Output() public deleteQuoteSubjectivity = new EventEmitter();

    private formattedQuoteSubjectivityText: string;

    get formattedQuoteSubjectivity() {
        let valueToReturn: string = "";
        if (this.formattedQuoteSubjectivityText) {
            valueToReturn = this.formattedQuoteSubjectivityText;
        }
        if (this.quoteSubjectivity) {
            this.formattedQuoteSubjectivityText = this.quoteSubjectivityService.formatSubjectivityDisplayText(this.quoteSubjectivity);
            valueToReturn = this.formattedQuoteSubjectivityText;
        }
        return valueToReturn;
    }

    constructor(public readonly quoteSubjectivityService: QuoteSubjectivityService) {
    }

    public removeQuoteSubjectivity() {
        this.deleteQuoteSubjectivity.emit();
    }
}
