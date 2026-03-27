using System;
using System.Diagnostics;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;

namespace Hero.Infrastructure;

public class GeolocationDelegatingHandler : DelegatingHandler
{
    private readonly TelemetryClient _telemetryClient;

    public GeolocationDelegatingHandler(TelemetryClient telemetryClient)
    {
        _telemetryClient = telemetryClient;
    }
    
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var timestamp = DateTimeOffset.UtcNow;
        var stopwatch = new Stopwatch();
        stopwatch.Reset();
        stopwatch.Start();
        var response = await base.SendAsync(request, cancellationToken);
        stopwatch.Stop();

        var url = request.RequestUri?.ToString();
        var result =  await response.Content?.ReadAsStringAsync(cancellationToken);

        var dependencyTelemetry = new DependencyTelemetry
        {
            Target = request.RequestUri?.Host,
            Name = "Google Geocode API",
            Type = "Http",
            Timestamp = timestamp,
            Duration = stopwatch.Elapsed,
            ResultCode = ((int)response.StatusCode).ToString(),
        };
        dependencyTelemetry.Properties.Add("x-request", url);
        dependencyTelemetry.Properties.Add("x-response", result);

        _telemetryClient?.TrackDependency(dependencyTelemetry);
        return response;
    }
}