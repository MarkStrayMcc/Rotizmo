import { Injectable, OnDestroy } from "@angular/core";
import { Coverage } from "@app/models/auto-generated/Coverage";
import { QuoteService } from "@app/quote/services/quote.service";
import { TriaHttpService } from "@app/services/tria-http.service";
import { ReplaySubject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class TriaService implements OnDestroy {
    constructor(
        private readonly triaHttpService: TriaHttpService,
        private readonly quoteService: QuoteService) { }

    private readonly _destroyed$ = new ReplaySubject<void>(1);

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    public updateTriaPremium() {
        const quote = this.quoteService.getQuote();
        if (quote.premium === 0
            || quote.pricingInformation.length === 0
            || !this.hasTriaCoverage(quote.coverages)) {
            this.quoteService.setPropertyValue("triaPremium", 0);
        } else {
            this.triaHttpService.calculateTriaPremium(quote.pricingInformation)
                .pipe(
                    takeUntil(this._destroyed$),
                    tap((triaPremium) => this.quoteService.setPropertyValue("triaPremium", triaPremium)))
                .subscribe();
        }
    }

    private hasTriaCoverage(coverages: Coverage[]): boolean {
        return coverages.findIndex(c => c.coverageType.isAdditionalCoverage && c.coverageType.name === "TRIA") > 0;
    }

}

