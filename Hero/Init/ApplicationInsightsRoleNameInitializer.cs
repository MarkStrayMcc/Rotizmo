using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Extensions.Configuration;

namespace Hero.Init
{
    public class ApplicationInsightsRoleNameInitializer : ITelemetryInitializer
    {
        private string RoleName { get; }

        public ApplicationInsightsRoleNameInitializer(IConfiguration configuration)
        {
            this.RoleName = configuration["ApplicationInsights:RoleName"];
        }

        public void Initialize(ITelemetry telemetry)
        {
            telemetry.Context.Cloud.RoleName = this.RoleName;
        }
    }
}
