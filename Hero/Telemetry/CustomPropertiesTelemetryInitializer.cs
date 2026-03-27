using System.Collections.Generic;
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Http;
using System.Linq;

namespace Hero.Telemetry
{

    public class CustomPropertiesTelemetryInitializer : ITelemetryInitializer
    {
        private const string CustomPropertyPreAmble = "x-";
        private readonly IHttpContextAccessor _context;

        public CustomPropertiesTelemetryInitializer(IHttpContextAccessor context)
        {
            _context = context;
        }

        public void Initialize(ITelemetry telemetry)
        {
            if (telemetry is not ISupportProperties telemetryWithProperties) return;

            var items = _context?.HttpContext?.Items.Where(x => x.Key.ToString()!.StartsWith(CustomPropertyPreAmble));

            if (items == null) return;
            foreach (var item in items)
            {
                var key = item.Key.ToString();
                var value = item.Value?.ToString();

                telemetryWithProperties.Properties.TryAdd(key, value);
            }
        }
    }
}
