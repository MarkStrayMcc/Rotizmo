using System.Collections.Generic;

namespace Hero.Models
{

    public class FeeRequest
    {
        public string ProductName { get; set; }
        public string CountryIsoCode { get; set; }
        public string StateIsoCode { get; set; }
        public string QuoteType { get; set; }
        public string InsuranceType { get; set; }
        public string ProgramCode { get; set; }
        public string TemplateCode { get; set; }
        public string Origin { get; set; }
        public string CurrencyIsoCode { get; set; }
        public decimal ExchangeRate { get; set; }
        public decimal? TotalFee { get; set; }
        public decimal EffectiveCommission { get; set; }
        public decimal StandardCommission { get; set; }
        public List<BusinessLinePremium> BusinessLinePremiums { get; set; }
        public int? BrokerGroupId { get; set;}
        public class BusinessLinePremium
        {
            public string BusinessLineCode { get; set; }
            public decimal Premium { get; set; }
        }
    }

}
