import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { takeUntil, shareReplay } from "rxjs/operators";
import { ILookup } from "@app/finance/lookups/interfaces/ILookup";

@Injectable()
export abstract class CachedLookupBaseService<T> implements ILookup<T> {
    private readonly cacheSize: number = 1;
    private cache$: Observable<T>;
    private reload$ = new Subject<void>();

    /**
     * Represents underlying cached data retrieved by requestData() method
     */
    protected get data$(): Observable<T> {
        if (!this.cache$) {
            // The shareReplay operator automatically creates a ReplaySubject 
            // between the original source and all future subscribers which
            // will be connected to that in-between Subject, so that effectively
            // there’s just one subscription to the underlying cold Observable
            this.cache$ = this.requestData()
                .pipe(takeUntil(this.reload$),
                    shareReplay(this.cacheSize));
        }
        return this.cache$;
    }

    /**
     * Invalidates the cached data
     */
    public forceReload(): void {
        // Calling next will complete the current cache instance
        this.reload$.next();

        // Setting the cache to null will create a new cache the
        // next time data$ getter is called
        this.cache$ = null;
    }

    /**
     * Gets requested lookup data filtered based on arguments passed
     * In most cases it should use this.data$
     */
    public abstract getData(): Observable<T>;

    /**
     * Retrieves data which is going to be cached and accessible by data$ getter
     */
    protected abstract requestData(): Observable<T>;
}
