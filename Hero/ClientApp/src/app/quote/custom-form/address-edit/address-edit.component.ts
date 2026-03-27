import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DBOperation } from "@app/enums/DBOperations";
import { AddressMapViewModal } from "@app/quote/popups/address-map-view-modal.component";
import { ClientAddressModal } from "@app/quote/popups/client-address-modal.component";
import { AddressClientLocationModal } from "@app/quote/popups/client-address-modal.model";
import { ClientManageAddressModal } from "@app/quote/popups/client-manageaddress-modal.component";
import { ModalConfig } from "@app/quote/popups/modal.config";
import { ModalDialogService } from "@app/services/modal-dialog.service";
import { Client, ClientLocation } from "@app/models";

@Component({
  selector: "app-address-edit",
  templateUrl: "address-edit.component.html",
  styleUrls: ["address-edit.component.scss"],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: AddressEditComponent,
    multi: true
  }]
})
export class AddressEditComponent implements OnInit, ControlValueAccessor {
  _onChange;

  @Input() public addressClientModalModel: any;
  @Input() public readonly: boolean;

  @Input() public client: Client;
  @Input() public insuredLocation: ClientLocation;
  @Input() public primaryLocation: ClientLocation;
  @Input() public isAuthorisedLocation: boolean;

  constructor(private readonly modalDialogService: ModalDialogService) { }

  public ngOnInit() {
  }

  public writeValue(obj: any): void {
  }

  public registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: any): void {
  }

  public setDisabledState?(isDisabled: boolean): void {
  }

  // Address Client Dialog
  public openClientAddressDialog() {
    this.modalDialogService.openDialog<ClientAddressModal, AddressClientLocationModal>(ClientAddressModal,
      ModalConfig.clientAddressModal.matDialogConfig, obj => {
        this.addressClientModalModel.dbOperation = DBOperation.view;
        obj.dialogModel = this.addressClientModalModel;
        obj.readOnly = this.readonly;
      },
      (result: AddressClientLocationModal) => this.onCloseClientAddressDialog(result),
      obj => obj.onChange.subscribe(() => this.checkAddressChanged())
    );
  }

  // UI
  private onCloseClientAddressDialog(result: AddressClientLocationModal) {
    setTimeout(() => {
      this.addressClientModalModel = result;
      if (this.addressClientModalModel) {
        if (this.addressClientModalModel.dbOperation === DBOperation.create ||
          this.addressClientModalModel.dbOperation === DBOperation.update) {
          this.openManageClientAddressDialog();
        } else if (this.addressClientModalModel.dbOperation === DBOperation.viewMap) {
          this.openClientAddressMapDialog(this.addressClientModalModel.locationId);
        }
      }
    },
      5);
  }

  // Address Map Client Dialog, needs access to state!
  public openClientAddressMapDialog(locationId: number) {
    this.modalDialogService.openDialog<AddressMapViewModal, AddressClientLocationModal>(AddressMapViewModal,
      ModalConfig.clientAddressMap.matDialogConfig, obj => {
        this.addressClientModalModel.dbOperation = DBOperation.viewMap;
        this.addressClientModalModel.locationId = locationId;
        this.addressClientModalModel.client = this.client;

        obj.dialogModel = this.addressClientModalModel;
        obj.readOnly = this.readonly;
      },
      (result: AddressClientLocationModal) => this.onCloseClientAddressMapDialog(result));
  }

  // Seems to be UI-related
  private onCloseClientAddressMapDialog(result: AddressClientLocationModal) {
    if (result) {
      if (result.dbOperation === DBOperation.view) {
        setTimeout(() => this.openClientAddressDialog(), 5);
      }
    }
  }

  // Address Manage(Add/Edit) Client Dialog
  public openManageClientAddressDialog() {
    if (this.readonly) {
      return;
    }
    this.modalDialogService.openDialog<ClientManageAddressModal, AddressClientLocationModal>(ClientManageAddressModal,
      ModalConfig.clientManageAddressModal.matDialogConfig, obj => { obj.dialogModel = this.addressClientModalModel; },
      () => this.onCloseManageClientAddressDialog()
    );
  }

  // Seems to be UI-related.
  public onCloseManageClientAddressDialog() {
    this.addressClientModalModel.dbOperation = DBOperation.view;
    setTimeout(() => this.openClientAddressDialog(), 5);
  }

  private checkAddressChanged() {
    if (!this.insuredLocation || this.client.primaryLocation.countryId !== this.insuredLocation.countryId ||
        this.client.primaryLocation.stateProvinceCode !== this.insuredLocation.stateProvinceCode) {
          this._onChange(this.client.primaryLocation);
    }
  }
}
