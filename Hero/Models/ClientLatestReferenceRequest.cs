using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class LatestQuoteReferenceRequest
    {
        public LatestQuoteReferenceRequest()
        {

        }
        public int? ClientId { get; set; }

        public string ProductName { get; set; }

        public int? ExcludeBrokerId { get; set; }
    }
}
