/// <reference path="../../../../node_modules/@types/jasmine/index.d.ts" />

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { CfcContact, CfcContactPersonalMessage, CfcContactPersonalMessageStatus } from "@app/models";
import { CfcContactHttpService } from "@app/services/cfc-contact-http.service";
import { CfcContactPersonalMessageHttpService } from "@app/services/cfc-contact-personal-message-http.service";
import { of } from "rxjs";
import { UserProfileComponent } from "./user-profile.component";

describe("userProfile component", () => {
    let component: UserProfileComponent;
    let fixture: ComponentFixture<UserProfileComponent>;
    let messageService: CfcContactPersonalMessageHttpService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UserProfileComponent],
            imports: [BrowserModule, HttpClientTestingModule, ReactiveFormsModule],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                CfcContactHttpService,
                CfcContactPersonalMessageHttpService
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(UserProfileComponent);
            component = fixture.componentInstance;
        });
    }));

    it("should retrieve current personal message on init", async(() => {
        prepareMocks();

        component.ngOnInit();
        component.ngOnDestroy();

        expect(messageService.getPersonalMessageById).toHaveBeenCalled();
        expect(component.personalMessage.personalMessage).toEqual("The answer is 42...");
        expect(component.personalMessage.cfcContactPersonalMessageStatus).toEqual(CfcContactPersonalMessageStatus.approved);
    }));

    it("should return empty background image URL if the contact is empty", async(() => {
        prepareMocks();

        component.ngOnInit();
        component.contact = null;
        const url = component.backgroundImageString;
        component.ngOnDestroy();

        expect(url).toBe("");
    }));

    // does not work due to an open bug in Angular: https://github.com/angular/angular/issues/7549
    // TODO: uncomment and finish implementation after it is possible to spy on debounced observable methods
    // it("should call CoreApi to set the personal message after the user changes it in HERO", fakeAsync(() => {
    //     prepareMocks();
    //     fixture.detectChanges();
    //     component.ngOnInit();
    //     tick();

    //     fixture.whenStable().then(() => {
    //         const element = fixture.nativeElement;
    //         const input = element.querySelector("input.txtProfileStatus");
    //         input.value = "new message";
    //         input.dispatchEvent(new Event("input"));

    //         fixture.whenStable().then(() => {
    //             tick();
    //             fixture.detectChanges();
    //             tick();
    //             expect(messageService.setPersonalMessage).toHaveBeenCalled();
    //         });
    //     });
    // }));

    function prepareMocks() {
        messageService = TestBed.inject(CfcContactPersonalMessageHttpService);
        component.contact = new CfcContact();
        component.contact.cfcContactId = 1;
        component.contact.profileImageUrl = "https://some/url.png";
        component.contact.initials = "ABC";

        const samplePersonalMessage = new CfcContactPersonalMessage();
        samplePersonalMessage.cfcContactId = 1;
        samplePersonalMessage.cfcContactPersonalMessageStatus = CfcContactPersonalMessageStatus.approved;
        samplePersonalMessage.personalMessage = "The answer is 42...";

        spyOn(messageService, "getPersonalMessageById").and.returnValue(of(samplePersonalMessage));
        spyOn(messageService, "setPersonalMessage").and.returnValue(of(true));
    }
});
