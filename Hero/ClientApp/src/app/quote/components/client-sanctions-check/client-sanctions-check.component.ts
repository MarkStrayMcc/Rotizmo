import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { SanctionStage } from "@app/enums/SanctionStage";
import { ClientLocation, Message, MessageCategory, MessageType } from "@app/models";
import { QuoteService } from "@app/quote/services/quote.service";
import { MessageService } from "@app/services/message.service";
import { UserService } from "@app/services/user.service";
import { Observable, of, Subject } from "rxjs";
import { switchMap, takeUntil, tap } from "rxjs/operators";
import { CheckClientSanctionsService } from "./check-client-sanctions.service";

@Component({
    selector: "client-sanctions-check",
    templateUrl: "./client-sanctions-check.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [],
})
export class ClientSanctionsCheckComponent implements OnDestroy, OnInit {
    public clientLocation$: Observable<ClientLocation>;
    public clientHasSanctions$: Observable<boolean>;

    private readonly _destroyed$ = new Subject<void>();

    constructor(
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly quoteService: QuoteService,
        private readonly checkClientSanctionsService: CheckClientSanctionsService
    ) { }

    ngOnInit(): void {
        if (this.userService.isFeatureAccessible("heroClientSanctionsCheckTrigger")) {
            this.clientLocation$ = this.watchClientLocationChanges$();
            this.clientHasSanctions$ = this.checkClientSanctions$();
            this.clientHasSanctions$
                .pipe(
                    tap((clientHasSanctions) => {
                        this.messageService.clearMessage(MessageCategory.SanctionsCheck);
                        if (clientHasSanctions) {
                            this.displayWarning();
                        }
                    })
                )
                .subscribe();
        }
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    private displayWarning() {
        this.messageService.sendMessage(
            new Message(
                "The client has been flagged by sanctions checking and will be automatically referred to the Compliance team once the quote is saved.",
                MessageType.Warning
            ),
            MessageCategory.SanctionsCheck
        );
    }

    private watchClientLocationChanges$ = () => this.quoteService.getQuoteProperty$((quote) => quote.client.primaryLocation);

    private checkClientSanctions$(): Observable<boolean | any> {
        return this.clientLocation$.pipe(
            takeUntil(this._destroyed$),
            switchMap((clientLocation: ClientLocation) => {
                const client = this.quoteService.getQuoteReference().client;
                const clientName = client.companyName;
                if (!!clientName && !!clientLocation?.country?.isoCode && !!client.id && !!client.uid) {
                    return this.checkClientSanctionsService.checkClientSanctions(
                        clientName,
                        client.uid,
                        client.id,
                        clientLocation.country.isoCode,
                        SanctionStage.PreQuote,
                        false
                    );
                }
                return of(false);
            })
        );
    }
}
