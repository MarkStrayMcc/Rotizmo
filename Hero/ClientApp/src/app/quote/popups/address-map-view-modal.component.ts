import { MapsAPILoader } from "@agm/core";
import { Component, EventEmitter, Inject, NgZone, OnInit, Output } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";

import { DBOperation } from "@app/enums/DBOperations";
import { ClientLocation } from "@app/models";
import { LocationHttpService } from "@app/services/location-http.service";
import { Observable } from "rxjs";
import { AddressClientLocationModal } from "./client-address-modal.model";
import { first } from "rxjs/operators";

declare var google: any;

@Component({
    selector: "address-map-view-modal",
    templateUrl: "address-map-view-modal.component.html",
    styleUrls: ["address-map-view-modal.component.scss"]
})
export class AddressMapViewModal implements OnInit {
    public dialogModel: AddressClientLocationModal;
    public isLoaded: boolean = false;
    public haveResult: boolean = false;
    public locationId: number;
    public locations: ClientLocation[];
    public zoom: number = 14;
    public searchText: string;
    public lat: number;
    public lng: number;
    public markers: IMarker[] = [];
    public primaryIcon: string = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    public searchResultNumber: number = -9999;
    public readOnly: boolean = false;
    @Output() public onChange = new EventEmitter();

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: number,
        public locationRef: MatDialogRef<Location>,
        public newDialog: MatDialog,
        public locationHttpService: LocationHttpService,
        private apiLoader: MapsAPILoader,
        private ngZone: NgZone) {
    }

    public ngOnInit() {
        this.locationId = this.dialogModel.locationId;
        if (this.locationId === 0) {
            // We want the default location
            this.locationId = this.dialogModel.client.primaryLocation.clientLocationId;
        }

        if (!this.locations) {
            this.locationHttpService.getMainData(this.dialogModel.client.id)
                .pipe(first())
                .subscribe(
                    val => this.locations = val,
                    error => console.error("Location Http Service Failure:", error),
                    () => this.buildMarker());
        }
    }

    public buildMarker() {
        const loc = this.getLocation(this.locationId);
        if (loc) {
            this.setMarker(loc);
        }
    }

    private getLocation(locationId: number) {
        return this.locations.find(p => p.clientLocationId === locationId);
    }

    public setPrimary(): void {
        const oldPrimary = this.markers.find(x => x.icon !== null);
        if (oldPrimary) {
            oldPrimary.icon = null;
        }

        const primary = this.markers.find(x => x.clientLocationId === this.locationId);
        if (primary) {
            primary.icon = this.primaryIcon;
            this.lat = primary.lat;
            this.lng = primary.lng;
            this.haveResult = true;

        } else {
            this.haveResult = false;
        }
        this.isLoaded = true;
    }

    public setMarker(clientLocation: ClientLocation): void {
        const self = this;

        const addressDescription =
            clientLocation.address1 + " " +
            clientLocation.address2 + " " +
            clientLocation.address3 + " " +
            clientLocation.city + ", " +
            clientLocation.postcode;

        this.getGeocoding(addressDescription).subscribe(x => {
            if (x) {
                const searchMarker: IMarker = {
                    clientLocationId: clientLocation.clientLocationId,
                    lat: x.lat(),
                    lng: x.lng(),
                    draggable: false
                };

                self.markers.push(searchMarker);
                self.locationId = clientLocation.clientLocationId;
                // Wrapping this in an ngZone run to solve some timing issues
                self.ngZone.run(() => {
                    self.setPrimary();
                });
            } else {
                self.ngZone.run(() => {
                    self.haveResult = false;
                });
            }
        });
    }

    public showLocation(postcode: string): void {

        // remove where searchResultNumber if it exists as we only want to show stored locations and search result
        const index = this.markers.findIndex(x => x.clientLocationId === this.searchResultNumber);
        if (index > -1) {
            this.markers.splice(index, 1);
        }

        const location = this.getLocation(this.searchResultNumber);
        this.setMarker(location);
    }

    public getGeocoding(address: string) {
        const self = this;

        return Observable.create(observer => this.getGeocodingApi(self, address, observer));
    }

    public onSearchLocation(): void {
        const searchTxt = this.searchText;
        if (searchTxt && searchTxt.trim() !== "") {
            this.showLocation(searchTxt);
        }
    }

    public openClientAddressDialog() {
        this.dialogModel.dbOperation = DBOperation.view;
        this.locationRef.close(this.dialogModel);
    }

    public getGeocodingApi(self, address: string, observer: any) {
        try {
            // at this point the variable google may still be undefined (google maps scripts still loading)
            // so load all the scripts, then...
            this.apiLoader.load().then(() => {
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode(
                    { address },
                    (results, status) => this.handleAndPublishGeocodingResults(status, results, observer, self, address)
                );
            });
        } catch (error) {
            observer.error("error getGeocoding" + error);
            observer.complete();
        }

    }

    private handleAndPublishGeocodingResults(status: any, results: any, observer: any, self: any, address: string) {
        if (status === google.maps.GeocoderStatus.OK) {
            const place = results[0].geometry.location;
            observer.next(place);
            observer.complete();
        } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            setTimeout(() => this.getGeocodingApi(self, address, observer), 100);
        } else {
            if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                observer.next(null);
            } else {
                console.error("Error - ", results, " & Status - ", status);
                observer.error(status);
            }
            observer.complete();
        }
    }
}

interface IMarker {
    icon?: string;
    lat: number;
    lng: number;
    label?: string;
    draggable: boolean;
    clientLocationId: number;
}
