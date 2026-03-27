import { APP_BASE_HREF, Location, LocationStrategy, PathLocationStrategy } from "@angular/common";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import {of, Subject} from "rxjs";
import { ConfigService } from "../../services/config.service";
import { UserService } from "@app/services/user.service";
import { MenuBarComponent } from "./menu-bar.component";

describe("MenuBarComponent", () => {
    let component: MenuBarComponent;
    let fixture: ComponentFixture<MenuBarComponent>;
    let configServiceSpy: jasmine.Spy;
    let mockUserService: jasmine.SpyObj<UserService>;
    const ADD_MEETING_SELECTOR = 'a[href*="AddMeetingNote"]';

    beforeEach(async(() => {
        mockUserService = jasmine.createSpyObj("UserService", ["isFeatureAccessible", "getData"]);
        mockUserService.isFeatureAccessible.and.returnValue(false);
        mockUserService.getData.and.returnValue(of(null));

        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: "finance/ledger", redirectTo: "" },
                    { path: "", redirectTo: "quote", pathMatch: "full" },
                    { path: "**", redirectTo: "quote", pathMatch: "full" }
                ])
            ],
            providers: [
                Location,
                { provide: LocationStrategy, useClass: PathLocationStrategy },
                { provide: APP_BASE_HREF, useValue: "/" },
                ConfigService,
                { provide: UserService, useValue: mockUserService }
            ],
            declarations: [MenuBarComponent],
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(MenuBarComponent);
        const configService = fixture.debugElement.injector.get(ConfigService);
        configServiceSpy = spyOnProperty(configService, "nerdUrl", "get")
            .and.returnValue("http://nerdtest/");
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));
    
    it("Should create component", async(() => {
        expect(component).toBeTruthy();
    }));

    it("Should return normalized NERD URL from the Configuration Service", async(() => {
        // Actors
        configServiceSpy.calls.reset();

        // Actions
        let result = component.nerdUrl;

        // Asserts
        expect(result).toBeDefined();
        expect(result).toBe("http://nerdtest");
        expect(configServiceSpy.calls.count()).toBe(1);
    }));

    it('Should show "Add meeting note" when isBrmFeatureActive is false', () => {
        mockUserService.isFeatureAccessible.and.returnValue(false);

        // Recreate the component so ngOnInit runs with the updated spy
        fixture = TestBed.createComponent(MenuBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.isBrmFeatureActive).toBeFalsy();

        const link = fixture.debugElement.query(By.css(ADD_MEETING_SELECTOR));
        expect(link).not.toBeNull();
        expect(link.nativeElement.textContent.trim()).toBe("Add meeting note");
    });

    it('Should not show "Add meeting note" when isBrmFeatureActive is true', () => {
        mockUserService.isFeatureAccessible.and.returnValue(true);

        fixture = TestBed.createComponent(MenuBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.isBrmFeatureActive).toBeTruthy();

        const link = fixture.debugElement.query(By.css(ADD_MEETING_SELECTOR));
        expect(link).toBeNull();
    });
});
