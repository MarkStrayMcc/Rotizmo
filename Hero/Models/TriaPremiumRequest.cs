using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class TriaPremiumRequest
    {
        public IEnumerable<TriaPricingInformation> TriaPricingInformation { get; set; }
    }
}
