import { Injectable, NgZone } from "@angular/core";
import { ApplicationInsightsService } from "./application-insights.service";
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { environment } from 'environments/environment';
import { v4 as uuid } from 'uuid';
import {Quote} from "@app/models";

@Injectable({ providedIn: "root" })
export class LoggingService {
    appInsights: ApplicationInsights;
    currentPage: string = null;

    constructor(private readonly applicationInsightsService: ApplicationInsightsService) {
        console.log("appInsights Key " + environment.appInsights.instrumentationKey);
        this.appInsights = new ApplicationInsights({
            config: {
                instrumentationKey: environment.appInsights.instrumentationKey,
                autoTrackPageVisitTime: false,
                enableCorsCorrelation: true,
                enableAutoRouteTracking: false // option to log all route changes
            }
        });
        this.appInsights.loadAppInsights();
        var telemetryInitializer = (envelope) => {
            envelope.tags["ai.cloud.role"] = "Hero";
        }
        this.appInsights.addTelemetryInitializer(telemetryInitializer);
    }

    logException = (exception: Error): void => {
        console.log(exception);
        this.applicationInsightsService.logException(exception);
    }

    logInfo = (info: string, quote?:Quote): void => {
        console.log(info);
        let properties = {};
        if (quote && properties) {
            properties = this.enrichProperties(properties, quote);
        }

        this.appInsights.trackTrace({
                message: info,
                severityLevel: 1, // 0: Verbose, 1: Information, 2: Warning, 3: Error, 4: Critical
                properties:properties
            });
    }

    logPageView(name?: string, url?: string) { // option to call manually
        console.log("page view for " + name);
        this.appInsights.trackPageView({
            name: name,
            uri: url
        });
    }

    startPageView(name?: string) { // option to call manually

        console.log("current page is" + this.currentPage);
        if (name != this.currentPage) {
            console.log("abruptly stopping page " + this.currentPage);
            this.stopPageView(this.currentPage);
        }
        console.log("start page view for " + name);
        this.appInsights.startTrackPage(name);
        this.currentPage = name;
    }

    stopPageView(name?: string, url?: string, properties?: {}, quote?: Quote) { // option to call manually
        console.log("stop page view for " + name);
        if(quote && properties) {
            properties = this.enrichProperties(properties, quote);
        }
        this.appInsights.stopTrackPage(name, url, properties);
    }

    startCustomEvent(name?: string) {
        console.log("StartCustomEvent " + name)
        this.appInsights.startTrackEvent(name);
    }

    stopCustomEvent(name?: string, properties?: {}, quote?: Quote) {
        if(quote && properties) {
           properties = this.enrichProperties(properties, quote);
        }
        console.log("StopCustomEvent " + name)
        this.appInsights.stopTrackEvent(name, properties);
    }

    enrichProperties(properties: {}, quote: Quote): {} {
        let quoteProperties = {
            "x-is-augmented": (quote.isAugmented ?? false).toString(),
            "x-total-risk-questions": (quote.totalNumberOfRiskQuestions ?? 0).toString(),
            "x-number-of-enriched-risk-questions": (quote.numberOfRiskQuestionAnswersEnriched ?? 0).toString(),
            "x-enquiry-id": quote.enquiryId?.toString(),
            "x-draft-quote-id": quote.draftQuoteId?.toString(),
            "x-quote-reference": quote.quoteReference?.toString(),
            "x-quote-uid": quote?.quoteUid,
            "x-quote-type": quote.quoteType?.toString(),
            "x-quote-state": quote.state?.toString(),
            "x-client-id": quote.client?.id,
            "x-client-name": quote.client?.companyName,
            "x-broker-team": quote.brokerTeam?.broker?.companyName,
            "x-product-id": quote.product?.productId,
            "x-product-name": quote.product?.productName,
            "x-actual-gross-commission": quote.commissionInformation?.actualGrossCommission?.toString(),
            "x-original-gross-commission": quote.commissionInformation?.originalGrossCommission?.toString(),
            "x-currency-iso-code": quote.currency?.isoCode,
            "x-premium": quote.premium?.toString(),
            "x-total-due": quote.totalDue?.toString(),
            "x-tax-rate": quote.taxRate?.toString(),
            "x-policy-number": quote?.policyNumber,
            "x-is-approved": quote.isApproved?.toString(),
            "x-is-published": quote.isPublished?.toString(),
            "x-is-bindable": quote.isBindable?.toString(),
            "x-is-editable": quote.isEditable?.toString(),
            "x-user-email": quote.assignedContact?.email,
        };
        properties = {...properties, ...quoteProperties};

        return properties
    }
}
