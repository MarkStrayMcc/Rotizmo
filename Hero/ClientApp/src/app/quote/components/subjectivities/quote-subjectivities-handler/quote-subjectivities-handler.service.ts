import { Injectable } from "@angular/core";
import { QuoteSubjectivity } from "@app/models";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class QuoteSubjectivitiesHandlerService {
    /**
     * Why use a BehaviorSubject? Why not a Subject? Why not an Observable.
     * BehaviorSubjects are special kind of Subjects that always emits the most
     * recent value that it held.
     * In this case, we need every subscriber to get the most recent list of quote
     * subjectivities.
     */
    private quoteSubjectivitiesSubject: BehaviorSubject<QuoteSubjectivity[]>;
    public quoteSubjectivities$: Observable<QuoteSubjectivity[]>;
    private quoteSubjectivities: QuoteSubjectivity[] = [];

    constructor() {
        this.quoteSubjectivitiesSubject = new BehaviorSubject<QuoteSubjectivity[]>(this.quoteSubjectivities);
        this.quoteSubjectivities$ = this.quoteSubjectivitiesSubject.asObservable();
    }

    public addQuoteSubjectivity(quoteSubjectivity: QuoteSubjectivity) {
        this.quoteSubjectivities.push(quoteSubjectivity);
        this.quoteSubjectivitiesSubject.next(this.quoteSubjectivities);
    }

    public removeQuoteSubjectivity(subjectivityIndex: number) {
        if (this.quoteSubjectivities.length <= subjectivityIndex) {
            this.quoteSubjectivitiesSubject.error("Index out of bounds! I don't have that many quote subjectivities just yet.");
        }
        this.quoteSubjectivities.splice(subjectivityIndex, 1);
        this.quoteSubjectivitiesSubject.next(this.quoteSubjectivities);
    }
}
