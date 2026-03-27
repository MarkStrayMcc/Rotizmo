import { async, inject, TestBed } from "@angular/core/testing";
import { DictionaryHelperService } from '@app/services/dictionary-helper.service';

describe("DictionaryHelperService", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                DictionaryHelperService
            ]
        }).compileComponents();
    }));

    it("Should be created", inject([DictionaryHelperService], (dictionaryHelperService: DictionaryHelperService) => {
        expect(dictionaryHelperService).toBeTruthy();
    }));

    it("Should get dictionary keys by alphabetical order", inject([DictionaryHelperService], (dictionaryHelperService: DictionaryHelperService) => {
        // Arrange
        const dictionary: { [key: number]: string } = {
            "0": "b",
            "1": "a",
            "2": "c"
        };

        // Act
        const result = dictionaryHelperService.getDictionaryKeysByAlphabeticalOrder(dictionary);

        // Assert
        expect(dictionaryHelperService).toBeTruthy();
        expect(result[0]).toBe("1");
        expect(result[1]).toBe("0");
        expect(result[2]).toBe("2");
    }));
});