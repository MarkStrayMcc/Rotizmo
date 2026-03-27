using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class PaymentRequest : WebApiDto.Dto.PaymentRequest
    {
        public string AccountingReferenceDateFormattedString { get; set; } 
    }
}
