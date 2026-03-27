import { ClientLocation, BrokerTeam } from "@app/models";

const canadaCountryIsoCode = "CA";
const unitedStatesCountryIsoCode = "US";
const australiaCountryIsoCode = "AU";
const newZealandCountryIsoCode = "NZ";
const unitedStatesCountryId = 4;

export function isCountryByIsoCode(address: ClientLocation, countryIsoCode: string) {
    return address && address.country && address.country.isoCode === countryIsoCode;
}

export function isCountryById(address: ClientLocation, countryId: number) {
    return address && address.country && address.country.countryId === countryId;
}

export function isUnitedStates(address: ClientLocation) {
    if (address && address.country.isoCode) {
        return isCountryByIsoCode(address, unitedStatesCountryIsoCode);
    }

    if (address && address.country.countryId) {
        return isCountryById(address, unitedStatesCountryId);
    }

    return false;
}

export function isAustralia(address: ClientLocation) {
    return isCountryByIsoCode(address, australiaCountryIsoCode);
}

export function isNewZealand(address: ClientLocation) {
    return isCountryByIsoCode(address, newZealandCountryIsoCode);
}

export function isCanada(address: ClientLocation) {
    return isCountryByIsoCode(address, canadaCountryIsoCode);
}

export function isCanadianBroker(brokerTeam: BrokerTeam) {
    return brokerTeam &&
        brokerTeam.broker &&
        brokerTeam.broker.country &&
        brokerTeam.broker.country.isoCode === canadaCountryIsoCode;
}
