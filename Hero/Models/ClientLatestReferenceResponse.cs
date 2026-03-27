using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class ClientLatestReferenceResponse
    {
        public int? QuoteReference{ get; set; }
    }
}
