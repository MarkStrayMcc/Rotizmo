import { Component, forwardRef, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, NG_VALUE_ACCESSOR } from "@angular/forms";
import { isAdmitted, isCanada, isCanadianBroker } from "@app/helpers";
import { Quote, RiskQuestion } from "@app/models";
import { CountryService } from "@app/quote/services/country.service";
import { RiskService } from "@app/services/risk-service";
import { UserService } from "@app/services/user.service";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { first } from "rxjs/operators";


const usaCountryId = 4;

@Component({
    providers: [
        {
            multi: true,
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BindQuoteBasicStepComponent)
        }
    ],
    selector: "bind-quote-basic-step",
    styleUrls: ["./bind-quote-basic-step.component.scss"],
    templateUrl: "./bind-quote-basic-step.component.html"
})

export class BindQuoteBasicStepComponent implements OnInit, OnDestroy {
    @Input() public form: FormGroup;
    @Input() public countryId: number;
    @Input() public brokerTeamId: number;
    @Input() public state: string;
    @Input() public quote: Quote;

    public riskQuestions: RiskQuestion[];
    protected stepNumber = 4;
    protected readonly = false;

    private questionChangeSubscription: Subscription;
    private stepIsLoading = true;

    constructor(
        private readonly countryService: CountryService,
        private readonly riskService: RiskService,
        private readonly userService: UserService
    ) {
    }

    public get showSurplusLinesBroker(): boolean {
        return this.countryId === usaCountryId && !isAdmitted(this.quote.product);
    }

    public get isLocalBrokerVisible(): boolean {
        return this.isCanadianBrokerVisible || this.isEeaBrokerVisible;
    }

    public get isCanadianBrokerVisible (): boolean {
        return isCanada(this.quote.insuredLocation) && !isCanadianBroker(this.quote.brokerTeam);
    }

    public get isEeaBrokerVisible (): boolean {
        return this.userService.isFeatureAccessible("heroEeaBroker") &&
            this.countryService.isEeaCountry(this.quote.insuredLocation.country.isoCode) &&
            !this.countryService.isEeaCountry(this.quote.brokerTeam.broker.country.isoCode);
    }

    public ngOnInit(): void {
        this.riskService
            .updateRiskQuestions(this.quote.draftQuoteId, this.quote.quoteReference)
            .pipe(first())
            .subscribe(
                riskQuestions => {
                    this.riskQuestions = riskQuestions.filter(riskQuestion => {
                        if (riskQuestion.tag === "ABN") {
                            riskQuestion.isMandatory = true;
                            return riskQuestion;
                        }
                    });
                },
                error => console.error(error),
                () => this.stepIsLoading = false
            );

        if (this.form && this.form.controls.inceptionDate) {
            this.form.controls.inceptionDate.valueChanges.subscribe(newDate => {
                if (this.quote) {
                    const targetDate = moment(newDate);

                    this.form.controls.expiryDate.setValue(targetDate.add(this.quote.policyPeriod, "M"));
                }
            });
        }
    }

    public ngOnDestroy() {
        if (this.questionChangeSubscription) {
            this.questionChangeSubscription.unsubscribe();
        }
    }

    public get isLoading(): boolean {
        return this.stepIsLoading;
    }    
}
