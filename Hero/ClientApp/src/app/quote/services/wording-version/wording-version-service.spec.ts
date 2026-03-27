/* tslint:disable:max-classes-per-file */
import { WordingVersionService } from "./wording-version-service";
import { FakeWordingVersionHttpService } from "./wording-version.service.mock";

describe('WordingVersionService', () => {
    let wordingVersionService: WordingVersionService;
    let wordingVersionServiceHttpService = new FakeWordingVersionHttpService(null);

    beforeEach(() => {
        wordingVersionService = new WordingVersionService(wordingVersionServiceHttpService);
    });

    it('should create WordingVersionService', () => {
        expect(wordingVersionService).toBeTruthy();
    });
});
