namespace Hero.Models
{
    using WebApiDto.Attributes;

    [ExportToTypeScript]
    public class QuoteBindRequest : WebApiDto.Dto.QuoteBindRequest
    {
        // for fee calc in UI
        public ClientLocation InsuredLocation { get; set; }
        public Product Product { get; set; }
        public decimal Premium { get; set; }
        public Payment Payment { get; set; }
        public Currency Currency { get; set; }
    }
}
