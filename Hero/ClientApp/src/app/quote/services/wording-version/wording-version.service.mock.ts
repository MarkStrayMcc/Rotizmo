import { Injectable } from "@angular/core";
import { DropDownItem } from "@app/models";
import { WordingVersionsRequest } from "@app/quote/models/WordingVersionsRequest";
import { BaseService } from "@app/services/base.service";
import { Observable } from "rxjs";

export class FakeWordingVersionHttpService extends BaseService {
	public getWordingVersions(productCode: string, countryCode: string, languageCode: string): Observable<DropDownItem[] | any> {
		return null;
	}

	public getExcessWordingVersions(productCode: string, countryCode: string, languageCode: string): Observable<DropDownItem[] | any> {
		return null;
	}

	public isPublishableWordingVersion(wordingVersionId: number): Observable<boolean | any> {
		return null;
	}
}

export const wordingVersionsRequest: WordingVersionsRequest = {
	territory: "US",
	product: "CPM",
	languageCode: "en",
};

export function getTestWordingVersions() {
	return [
		{
			value: "1",
			text: "Wording 1.0",
		},
		{
			value: "2",
			text: "Wording 1.1",
		},
		{
			value: "3",
			text: "Wording 1.2",
		},
	] as DropDownItem[];
}

export function getTestExcessWordingVersions() {
	return [
		{
			value: "1",
			text: "Excess 1.0",
		},
		{
			value: "2",
			text: "Excess 1.1",
		},
		{
			value: "3",
			text: "Excess 1.2",
		},
	] as DropDownItem[];
}
