import { async, inject, TestBed } from "@angular/core/testing";
import { XHRBackend } from "@angular/http";
import { MockBackend } from "@angular/http/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ClientFolderService } from "@app/services/client-folder.service";

describe("ClientFolderService", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: XHRBackend,
                    useClass: MockBackend,
                },
                ClientFolderService,
            ],
            imports: [HttpClientTestingModule],
        });
    }));

    it("Should be created",
        inject([XHRBackend, ClientFolderService], (service: ClientFolderService) => {
            expect(service).toBeTruthy();
        }),
    );
});
