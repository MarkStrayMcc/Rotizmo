import { Component, OnInit, Output, EventEmitter, OnDestroy, HostListener} from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { DBOperation } from "@app/enums/DBOperations";
import { LocationHttpService } from "@app/services/location-http.service";
import { AddressClientLocationModal } from "@app/quote/popups/client-address-modal.model";
import { ClientLocation } from "@app/models";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { Subscription } from "rxjs";
import { first } from "rxjs/operators";


@Component({
    selector: "client-address-modal",
    templateUrl: "client-address-modal.component.html"
})
export class ClientAddressModal implements OnInit, OnDestroy {
    public locations: ClientLocation[] = null;
    public dialogModel: AddressClientLocationModal;
    public isLoaded: boolean = false;
    public dbPrimaryAddressId: number;
    public locationSubscription: Subscription;
    @Output() public onChange = new EventEmitter();
    public readOnly:boolean = false;
    
    constructor(public dialogRef: MatDialogRef<ClientAddressModal>,
        public locationHttpService: LocationHttpService,
        public modalDialogService: ModalDialogService) {

        dialogRef.backdropClick().subscribe(_ => {
            this.onCloseModal();
        });

    }

    @HostListener('window:keyup.esc')
    public onKeyUp() {
        this.onCloseModal();
    }

    public ngOnInit() {
        this.locationSubscription = this.locationHttpService.getMainData(this.dialogModel.client.id)
            .pipe(first())
            .subscribe((val) => {
                    this.locations = val;
                },
                (error) => { console.log(`Error happened: ${error}`); },
                () => {
                    this.setPrimaryLocation();
                    this.isLoaded = true;
                });
        }

    public ngOnDestroy(): void {
        if (this.locationSubscription) {
            this.locationSubscription.unsubscribe();
        }
    }

    public setSelectedOption(index: number): void {
        if (this.readOnly)
            return;
        this.dialogModel.client.primaryLocation = this.locations[index];
        this.onCloseModal();
    }

    public setPrimaryLocation(): void {

        const primaryLocation = this.locations.find((p) => p.isPrimaryLocation);

        if (this.dialogModel.client.primaryLocation) {
            const selectedPrimmary = this.locations.find((p) => p.clientLocationId === this.dialogModel.client.primaryLocation.clientLocationId);
            if (!selectedPrimmary) {
                this.dialogModel.client.primaryLocation = primaryLocation;
            } else {
                this.dialogModel.client.primaryLocation = selectedPrimmary;
            }

        } else {
            this.dialogModel.client.primaryLocation = primaryLocation;
        }
    }

    public onEditLocation(index: number): void {
        if (this.readOnly)
            return;
        this.dialogModel.dbOperation = DBOperation.update;
        this.dialogModel.editLocation = this.locations[index];

        this.dialogModel.client.primaryLocation = this.dialogModel.editLocation;

        this.dialogModel.modalBtnTitle = "Update";
        this.dialogModel.modalTitle = "Edit Address";
        this.dialogRef.close(this.dialogModel);
    }

    public onAddLocation(): void {
        if (this.readOnly)
            return;
        this.dialogModel.dbOperation = DBOperation.create;

        this.dialogModel.modalBtnTitle = "Save";
        this.dialogModel.modalTitle = "Add Address";
        this.dialogRef.close(this.dialogModel);
    }

    public onRemoveLocation(index: number, event): void {
        if (this.readOnly)
            return;
        if (this.locations.length > 1) {
            const selectedLocation = this.locations[index];

            selectedLocation.country = null;
            this.locationHttpService.delete(selectedLocation)
                .subscribe(
                (data) => {
                    if (data.succeeded === true) {
                        this.locations = null;
                        this.ngOnInit();
                    } else {
                        console.log(data.message);
                    }
                },
                (error) => {
                    console.log(error);

                });
        }
        event.stopPropagation();
    }

    public onViewMap(locationId: number, event: any) {
        if (event) {
            event.stopPropagation();
        }

        this.dialogModel.dbOperation = DBOperation.viewMap;
        this.dialogModel.locationId = locationId;

        this.onCloseModal();
     
    }

    public onCloseModal(): void {
        this.onChange.emit();
        this.dialogRef.close(this.dialogModel);
    }
}
