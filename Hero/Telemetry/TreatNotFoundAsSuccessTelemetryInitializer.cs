using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;

namespace Hero.Telemetry;

public class TreatNotFoundAsSuccessTelemetryInitializer : ITelemetryInitializer
{
    public void Initialize(ITelemetry telemetry)
    {
        if (telemetry is RequestTelemetry { ResponseCode: "404" } requestTelemetry)
        {
            requestTelemetry.Success = true;
        }
    }
}