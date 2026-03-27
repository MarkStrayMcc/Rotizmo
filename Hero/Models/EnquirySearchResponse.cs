using System.Collections.Generic;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class EnquirySearchResponse
    {
        public ICollection<EnquirySearchResult> Results { get; set; }
    }
}
