import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Constants } from "@app/constants/constants";
import { RiskQuestion, RiskQuestionAnswer } from "@app/models";
import { EnrichedData } from "@app/models/enrichedData";
import { RiskQuestionAnswerPipe } from "@app/pipes/risk-question-answer/risk-question-answer.pipe";
import { EnrichmentAdapterService } from "@app/quote/services/enrichment-adapter.service";
import { QuoteService } from "@app/quote/services/quote.service";
import { BaseStepComponent } from "@app/quote/steps/base-step.component";
import { RiskService } from "@app/services/risk-service";
import { UserService } from "@app/services/user.service";
import { LoggingService } from "@app/services/logging.service";
import { Subscription, of } from "rxjs";
import { first, map, mergeMap, tap } from "rxjs/operators";

@Component({
	selector: "risk-step",
	templateUrl: "risk-step.component.html",
	styleUrls: ["risk-step.component.scss"],
})
export class RiskStepComponent extends BaseStepComponent implements OnInit, OnDestroy {
	public riskQuestions: RiskQuestion[];

	private valueChangesSubscription: Subscription;

	constructor(
		private readonly riskService: RiskService,
		private readonly quoteService: QuoteService,
		private readonly userService: UserService,
		private readonly enrichmentAdapterService: EnrichmentAdapterService,
		private readonly riskQuestionAnswerPipe: RiskQuestionAnswerPipe,
		private readonly loggingService: LoggingService
	) {
		super();
	}

	public ngOnInit(): void {
		this.riskService
			.updateRiskQuestions(this.vm.draftQuoteId, this.vm.quoteReference)
			.pipe(
				first(),
				mergeMap(async (riskQuestions: RiskQuestion[]) => {
					try {
						await this.getEnrichmentData(riskQuestions);
					} catch (err) {						
						this.loggingService?.logException(err instanceof Error ? err : new Error(String(err)));
					}
					return riskQuestions;
				})
			)
			.subscribe(
				(riskQuestions) => (this.riskQuestions = riskQuestions),
				(error) => console.error(error),
				() => {
					this.loaded = true;

					setTimeout(() => {
						this.valueChangesSubscription = this.stepForm.valueChanges.subscribe((changes) => {
							this.valueChangeHandler(changes.riskQuestionAnswers);
						});
						this.riskService.updateRiskQuestionAnswers(this.stepForm.value.riskQuestionAnswers);
						this.setInitialise();
					}, 0);
				}
			);

		this.stepForm = new FormGroup({
			riskQuestionAnswers: new FormControl(this.vm.riskQuestionAnswers ? this.vm.riskQuestionAnswers : []),
		});

		if (this.readonly) {
			this.stepForm.disable();
		}
	}

	public ngOnDestroy() {
		if (this.valueChangesSubscription) {
			this.valueChangesSubscription.unsubscribe();
		}
		super.ngOnDestroy();
	}

	private async getEnrichmentData(riskQuestions: RiskQuestion[]) {
        const clientUid = this.quoteService.getQuote().client?.uid;
        this.vm.totalNumberOfRiskQuestions = riskQuestions.length;
		if (this.shouldRetrieveEnrichedData(clientUid, riskQuestions)) {
			const enrichmentData: EnrichedData[] | null = await this.enrichmentAdapterService.getEnrichmentDataByClientUid(clientUid).toPromise();
			this.addEnrichedRiskQuestionAnswers(riskQuestions, enrichmentData);
        }

	}

	private addEnrichedRiskQuestionAnswers(riskQuestions: RiskQuestion[], enrichmentData: EnrichedData[] | null) {
		if (enrichmentData != null) {
            const enrichedRiskQuestions = riskQuestions.filter((rq) => rq.isEnrichment === true);
            let numberOfEnrichedRiskQuestions = 0;
			enrichedRiskQuestions.forEach((rq) => {
				const enrichedData = enrichmentData.find((ed) => ed.key === rq.tag);
				if (enrichedData) {
					const index = this.vm.riskQuestionAnswers.findIndex((rqa) => rqa.riskQuestionTag === rq.tag);
					const enrichedRiskQuestionAnswer = this.riskQuestionAnswerPipe.transform(enrichedData.value.value, rq);
					if (index >= 0) {
						this.vm.riskQuestionAnswers.splice(index, 1, enrichedRiskQuestionAnswer);
                    } else this.vm.riskQuestionAnswers.push(enrichedRiskQuestionAnswer);                    
                    numberOfEnrichedRiskQuestions++;
				}
            });          
            this.vm.numberOfRiskQuestionAnswersEnriched = numberOfEnrichedRiskQuestions;
            this.vm.isAugmented = (numberOfEnrichedRiskQuestions > 0);
		}
	}

	private shouldRetrieveEnrichedData(clientUid: string, riskQuestions: RiskQuestion[]): boolean {
		const enrichmentAdapterFeatureFlag = this.userService.isFeatureAccessible("heroEnrichedRiskQuestions");
		return (
			enrichmentAdapterFeatureFlag === true &&
			riskQuestions?.findIndex((rq: RiskQuestion) => rq.isEnrichment === true) >= 0 &&
			clientUid?.length > 0 &&
			this.vm.draftQuoteId !== Constants.emptyGuid
		);
	}

	private valueChangeHandler(answers: RiskQuestionAnswer[]): void {
		if (this.stepForm.enabled) {
			this.riskService.updateRiskQuestionAnswers(answers);
			this.buttonStatus = {
				canSaveAfterRecalculate: false,
				allowRecalculate: true,
			};
			this.setChange();
		}
	}
}
