import {  Injectable } from "@angular/core";
import {
  Country,
  Currency,
  CfcContact,
  DropDownItem,
  RiskQuestionOption,
  SurplusLine
} from "@app/models";

@Injectable()
export class DropDownManagerService  {

    constructor() {

    }

    //Set the dropDownItem from an object
    public setDropDownItem<T>(obj: T, callbackfn: (obj: T) => DropDownItem) {
        let retItem: DropDownItem = null;

        if (obj) {
            retItem = callbackfn(obj);
        }

        return retItem;
    }

    public setAssignedContactDropDownItem(assignedContact: CfcContact): DropDownItem {

        const item = ({
            text: assignedContact.name,
            value: String(assignedContact.cfcContactId),
            img: assignedContact.profileImageUrl,
            hidden: assignedContact.email,
        }) as DropDownItem;

        return item;
    }

    public setCurrencyDropDownItem(currency: Currency): DropDownItem {

        const item = ({
            text: `${currency.symbol} | ${currency.isoCode} | ${currency.name}`,
            value: String(currency.id),
        }) as DropDownItem;

        return item;
    }

    public setSurplusLineDropDownItem(surplusLine: SurplusLine): DropDownItem {
        if (!surplusLine) {
            return new DropDownItem("", "", null);
        }
        return ({
            text: "" + surplusLine.licenseNumber.trim() + " (" + surplusLine.brokerName + ", " + surplusLine.contactName + ")",
            value: surplusLine.id.toString()
        }) as DropDownItem;
    }

    public setCountryDropDownItem(country: Country): DropDownItem {
        const item = ({
            text: country.name,
            value: String(country.countryId),
            img: null,
            hidden: country.isoCode,
        }) as DropDownItem;

        return item;
    }

    public setRiskSelectOption(riskSelectOption: RiskQuestionOption): DropDownItem {
        const item = ({
            text: riskSelectOption.text,
            value: String(riskSelectOption.uid),
            img: null,
            hidden: String(riskSelectOption.riskQuestionTag)
        }) as DropDownItem;

        return item;
    }

    //set the object from a DropDownItem
    public setObjectFromDropDownItem<T>(item: DropDownItem, callbackfn: (item: DropDownItem) => T) {
        let retObj: T = null;

        if (item && item.hasOwnProperty("text") && item.hasOwnProperty("value")) {
            retObj = callbackfn(item);
        }

        return retObj;
    }

    public setCurrencyFromDropDownItem(item: DropDownItem): Currency {
        const itemValues = item.text.split("|");
        let currency = null;

        const n = itemValues.length;

        if (n > 1) {
            currency = {
                id: parseInt(item.value),
                name: itemValues[n - 1].trim(),
                isoCode: itemValues[n - 2].trim(),
                symbol: itemValues[n - 3].trim(),
            } as Currency;
        }

        return currency;
    }

    public setSurplusLineFromDropDownItem(item: DropDownItem): SurplusLine {
        const surplusLine = new SurplusLine();

        //surplusLine.value = item.value;
        //surplusLine.text = item.text;
        surplusLine.id = +item.value;

        return surplusLine;
    }

    public setAssignedContactFromDropDownItem(item: DropDownItem): CfcContact {

      const assignedContact = {
            cfcContactId: parseInt(item.value),
            name: item.text,
            email: item.hidden,
            profileImageUrl: item.img,
      } as CfcContact;

      return assignedContact;
    }

    public setCountryFromDropDownItem(item: DropDownItem): Country {

        const country = {
            countryId: parseInt(item.value),
            name: item.text,
            isoCode: item.hidden,
            currency: null,
        } as Country;

        return country;
    }

    // check the dropdown object for value property
    public setValueToDropDownObject(dropDownObj: any): any {

        if (dropDownObj && !dropDownObj.hasOwnProperty("value") && dropDownObj.hasOwnProperty("id"))
            dropDownObj.value = dropDownObj.id;

        return dropDownObj;
    }
}
