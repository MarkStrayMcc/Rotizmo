import { Component, OnInit } from "@angular/core";
import { CfcContact } from '@app/models/auto-generated/CfcContact';
import { ApplicationInsightsService } from "@app/services/application-insights.service";
import { CookieService } from 'ngx-cookie-service';
import { first } from "rxjs/operators";
import { AppCommunicationService } from "../../services/app-communication.service";
import { CfcContactHttpService } from '../../services/cfc-contact-http.service';
import { UserService } from "../../services/user.service";

@Component({
    selector: "app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    providers: [AppCommunicationService]
})

export class AppComponent implements OnInit {
    public className: string;
    private contact: CfcContact;

    constructor(
        private readonly appCommunicationService: AppCommunicationService,
        private readonly applicationInsightsService: ApplicationInsightsService,
        private readonly cfcContactHttpService: CfcContactHttpService,
        private readonly cookieService: CookieService,
        private readonly userService: UserService
    ) {
    }

    public ngOnInit(): void {
        if (!this.cookieService.check("UserInitials")) { return; }
        const userInitials = this.cookieService.get("UserInitials");

        this.cfcContactHttpService.getByInitials(userInitials)
            .pipe(first())
            .subscribe(contact => {
                if (contact) {
                    this.contact = contact;
                    this.userService.addUser(this.contact);
                    this.applicationInsightsService.setUserId(this.contact.cfcContactUid);
                }
            }, error => {
                console.log(JSON.stringify(error));
            });

        this.appCommunicationService.className$.subscribe(classname => {
            this.className = classname;
        });
    }
}
