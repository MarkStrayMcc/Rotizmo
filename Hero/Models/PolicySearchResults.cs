using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class PolicySearchResults
    {
        public long Count { get; set; }
        public IEnumerable<PolicySearchResult> Results { get; set; }
    }
}
