
/*Google Autoacomplete Api*/
export class AutocompleteRequest {
    public input: string;
    public types: string = "geocode";
    public components: string;
}

export interface AutocompleteResult {
    predictions: Prediction[];
}

export interface Prediction {
    description: string;
    id: string;
    place_Id: string;
}

/*Google Place Api */
export interface Location {
    lat: number;
    lng: number;
}

export interface Geometry {
    location: Location;
}

export interface Result {
    address_Components: Address_component[];
    adr_Address: string;
    geometry: Geometry;
}

export interface PlaceResult {
    result: Result;
}

export interface Address_component {
    long_name: string;
    short_name: string;
    types: string[];
}

/*Google geolocation api*/
export class GeoLocationRequest {
    public address1: string;
    public countryCode: string;
    public postcode: string;
}

export interface GeoLocationResult {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    county: string;
    postcode: string;
    countryCode: string;
    latitude: string;
    longitude: string;
    precision: string;
}
