using System;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class ClientSearchResult
    {
        public Guid ClientUid { get; set; }
        public string CompanyName { get; set; }
    }
}
