using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class OutstandingFundContributionsResponse
    {
        public List<OutstandingFundContribution> OutstandingFundContributions { get; set; }
    }
}
