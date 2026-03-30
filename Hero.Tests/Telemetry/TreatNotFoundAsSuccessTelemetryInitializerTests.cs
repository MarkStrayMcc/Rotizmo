using Hero.Telemetry;
using Microsoft.ApplicationInsights.DataContracts;

namespace Hero.Tests.Telemetry;

[TestFixture]
public class TreatNotFoundAsSuccessTelemetryInitializerTests
{
    [Test]
    public void ShouldTreatNotFoundAsSuccessfulRequest()
    {
        var telemetry = new RequestTelemetry()
        {
            ResponseCode = "404"
        };
            
        var telemetryInitializer = new TreatNotFoundAsSuccessTelemetryInitializer();
            
        telemetryInitializer.Initialize(telemetry);

        Assert.That(telemetry.Success, Is.True);
    }
    
    [Test]
    public void ShouldTreatSuccessAsSuccessfulRequest()
    {
        var telemetry = new RequestTelemetry()
        {
            ResponseCode = "200"
        };
            
        var telemetryInitializer = new TreatNotFoundAsSuccessTelemetryInitializer();
            
        telemetryInitializer.Initialize(telemetry);

        Assert.That(telemetry.Success, Is.Null); // null denotes success
    }    
        
    [Test]
    public void ShouldNotProcessRequestsWithOtherResponseCodes()
    {
        var telemetry = new RequestTelemetry()
        {
            ResponseCode = "500"
        };
            
        var telemetryInitializer = new TreatNotFoundAsSuccessTelemetryInitializer();
            
        telemetryInitializer.Initialize(telemetry);

        Assert.That(telemetry.Success, Is.Null); // null denotes success
    }        
}