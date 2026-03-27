import { Injectable } from "@angular/core";
import { ClientLocation } from "@app/models";
import { LocationHttpService } from "@app/services/location-http.service";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class InsuredAddressService {
    private readonly _insuredAddressesSubject = new BehaviorSubject<ClientLocation[]>([]);
    private readonly _selectedClientLocationIdsSubject = new BehaviorSubject<number[]>([]);
    
    public readonly insuredAddresses$ = this._insuredAddressesSubject.asObservable();
    public readonly selectedClientLocationIds$ = this._selectedClientLocationIdsSubject.asObservable();

    constructor(private readonly locationHttpService: LocationHttpService) { }

    public get = (clientId: number): Observable<void> => {
        return this.locationHttpService.getMainData(clientId).pipe(
            tap(insuredAddresses => this._insuredAddressesSubject.next(insuredAddresses))
        );
    }

    public select = (clientLocationId: number): void => {
        this._selectedClientLocationIdsSubject.next([...this._selectedClientLocationIdsSubject.value, clientLocationId]);
    }

    public unselect = (clientLocationId: number): void => {
        const selectedInsuredAddresses = this._selectedClientLocationIdsSubject.value.filter(id => id !== clientLocationId);
        this._selectedClientLocationIdsSubject.next(selectedInsuredAddresses);
    }
}
