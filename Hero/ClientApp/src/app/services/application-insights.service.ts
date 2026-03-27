import { Injectable, NgZone } from "@angular/core";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { environment } from "environments/environment";

@Injectable({ providedIn: "root" })
export class ApplicationInsightsService {
    private readonly applicationInsights: ApplicationInsights;
    
    constructor(private zone: NgZone) {
        this.applicationInsights = new ApplicationInsights({
            config: {
                autoTrackPageVisitTime: true,
                enableAutoRouteTracking: true,
                enableCorsCorrelation: true,
                enableRequestHeaderTracking: true,
                enableResponseHeaderTracking: true,
                instrumentationKey: environment.appInsights.instrumentationKey,
                samplingPercentage: 100, // disables sampling, sends all telemetry
            },
        });

        this.zone.runOutsideAngular(() => {
            this.applicationInsights.loadAppInsights();
        });
        (function(xhr) {
            const open = xhr.open;
            xhr.open = function() {
              return zone.runOutsideAngular(() => open.apply(this, arguments));
            };
        })(XMLHttpRequest.prototype);
    }

    public setUserId = (userId: string) => {
        this.applicationInsights.setAuthenticatedUserContext(userId, null, true);
    }

    public logException = (exception: Error | string | null | undefined, severityLevel?: number): void => {
        let errorToLog: Error;
        if (exception instanceof Error) {
            errorToLog = exception;
        } else if (typeof exception === 'string' && exception.length > 0) {
            errorToLog = new Error(exception);
        } else {
            errorToLog = new Error('Unknown error');
        }
        this.applicationInsights.trackException({ exception: errorToLog, severityLevel });
    }

}
