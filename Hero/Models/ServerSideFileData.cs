using System.Collections.Generic;

namespace Hero.Models
{
    public class ServerSideFileData
    {
        public string FileName { get; set; }
        public ServerSideFileType ServerSideFileType { get; set; }
        public string Reference { get; set; }
        public string CountryIsoCode { get; set; }
        public List<int>? QuoteIds { get; set; }
        public string StateProvinceCode { get; set; }
    }
}
