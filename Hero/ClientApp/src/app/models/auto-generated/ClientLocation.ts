// This an auto-generated file using TypeWriter extension for Visual Studio.
// Please do not manually edit it. In order to modify the auto-generated class, either modify the ViewModels.tst file
// Or edit the original class that was decorated with ExportToTypeScript attribute

import * as Models from "@app/models/auto-generated";
export class ClientLocation {
	public clientLocationId: number;
	public clientId: number;
	public address1: string;
	public address2: string;
	public address3: string;
	public city: string;
	public countryId: number;
	public postcode: string;
	public isPrimaryLocation: boolean;
	public stateProvinceCode: string;
	public county: string;
	public disabledOn: Date;
	public country: Models.Country;
	public longitude?: number;
	public latitude?: number;
	public clientLocationProperties?: Models.ClientLocationProperties[];
}
