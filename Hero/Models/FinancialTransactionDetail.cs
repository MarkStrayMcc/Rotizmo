using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class FinancialTransactionDetail : WebApiDto.Dto.FinancialTransactionDetail
    {
        public string Description { get; set; }

        public string EntryDateFormattedString { get; set; }

        public string PaidDateFormattedString { get; set; }
    }
}
