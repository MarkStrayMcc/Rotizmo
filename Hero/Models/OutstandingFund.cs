using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class OutstandingFund
    {
        public int OutstandingFundId { get; set; }

        public string CfcBankAccount { get; set; }

        public string LedgerReference { get; set; }

        public string BinderDescription { get; set; }

        public string TransactionReference { get; set; }

        public string TransactionType { get; set; }

        public string Tags { get; set; }

        public bool TpaFee { get; set; }

        public string CurrencyIsoCode { get; set; }

        public decimal TotalAmount { get; set; }

        public decimal OutstandingAmount { get; set; }

        public string Category => TpaFee ? "TPA Fee" : string.Empty;

        public string SectionShortCode { get; set; }

        public int? SectionId { get; set; }

        public string LloydsRiskCode { get; set; }

        public string BinderYear { get; set; }

        public string Notes { get; set; }
    }
}
