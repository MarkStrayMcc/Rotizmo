namespace Hero.Models
{
    using WebApiDto.Attributes;
    using System.Collections.Generic;
    [ExportToTypeScript]
    public class QuoteAttachment : ServerSideFileData
    {
        public List<int> QuoteIds { get; set; }
    }
}
