using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class OutstandingFundContribution
    {
        public long OutstandingFundId { get; set; }

        public int? CarrierReferenceId { get; set; }

        public decimal? OriginalAmount { get; set; }

        public decimal? BankAccountAmount { get; set; }

        public int MarketTypeId { get; set; }

        public string CarrierName { get; set; }

        public long FinancialTransactionId { get; set; }

        public string OriginalCurrencyIsoCode { get; set; }

        public string BankAccountCurrencyIsoCode { get; set; }
    }
}
