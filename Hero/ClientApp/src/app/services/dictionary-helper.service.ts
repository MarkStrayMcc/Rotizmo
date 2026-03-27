import { Injectable } from "@angular/core";

@Injectable()
export class DictionaryHelperService {
    public getDictionaryKeysByAlphabeticalOrder(dictionary: { [key: number]: string }) {
        return Object.keys(dictionary)
            .map((key) => {
                return { key: key, value: dictionary[key] };
            })
            .sort((x, y) => {
                if (x.value > y.value) {
                    return 1;
                }

                if (x.value < y.value) {
                    return -1;
                }

                return 0;
            })
            .map((x) => x.key);
    }
}