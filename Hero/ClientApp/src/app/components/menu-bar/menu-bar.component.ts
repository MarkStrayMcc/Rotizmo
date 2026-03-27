import { Location, LocationStrategy, PathLocationStrategy } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ConfigService } from "../../services/config.service";
import { UserService } from "@app/services/user.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "menu-bar",
  templateUrl: "./menu-bar.component.html",
  styleUrls: ["./menu-bar.component.scss"],
  providers: [
      Location,
      { provide: LocationStrategy, useClass: PathLocationStrategy },
  ],
})
export class MenuBarComponent implements OnInit, OnDestroy {
    public isBrmFeatureActive = false;
    private readonly destroy$ = new Subject<void>();

    constructor(
        private location: Location,
        private configService: ConfigService,
        private readonly userService: UserService
    ) { }

    public ngOnInit() {
        this.userService.getData()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.CheckBrokerFeatureToggle());
    }

    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get nerdUrl(): string {
        return this.location.normalize(this.configService.nerdUrl);
    }

    get adminUrl(): string {
        return this.location.normalize(this.configService.adminUrl);
    }

    get qlikDashboardUrl(): string {
        return this.configService.qlikDashboardUrl;
    }

    private CheckBrokerFeatureToggle() : void{
        this.isBrmFeatureActive = this.userService.isFeatureAccessible("disableEditBrokers")
    }
}
