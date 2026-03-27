using System.Collections.Generic;
using System;
using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class Transaction
    {
        public int TransactionId { get; set; }

        public string PolicyNumber { get; set; }

        public int? QuoteId { get; set; }

        public string BusinessLine { get; set; }

        public int BinderSectionId { get; set; }

        public string TransactionType { get; set; }

        public decimal ExchangeRate { get; set; }

        public int BrokerTeamId { get; set; }

        public int? LocalBrokerId { get; set; }

        public int? SLBrokerId { get; set; }

        public string NJTransNo { get; set; }

        public decimal? RateableTurnover { get; set; }

        public DateTime OrderReceivedOn { get; set; }

        public DateTime InceptionDate { get; set; }

        public DateTime AccountingReferenceDate { get; set; }
        public bool? Claims { get; set; }
        public string ExpiringCarrier { get; set; }

        public decimal? RateChange { get; set; }
        public string LimitBasis { get; set; }
        public string DeductibleBasis { get; set; }
        public string CostBasis { get; set; }
        public decimal GrossPremium { get; set; }
        public decimal PolicyFee { get; set; }
        public decimal PolicyLimit { get; set; }
        public decimal Deductible { get; set; }
        public decimal BrokerCommissionRate { get; set; }
        public decimal? ModelPremium { get; set; }
        public DateTime? DocsSentOn { get; set; }
        public DateTime? ExportedToBrokasureOn { get; set; }
        public string LloydsRiskCode { get; set; }
        public DateTime? SubjectivitiesReceivedOn { get; set; }
        public DateTime? IllinoisCertificateReceivedOn { get; set; }
        public DateTime PremiumPaymentDue { get; set; }
        public DateTime? UnderwriterSettlementDate { get; set; }
        public DateTime? CfcSettlementDate { get; set; }
        public DateTime? RetroDate { get; set; }
        public bool? SpecialException { get; set; }

        public string Notes { get; set; }
        public decimal? PolicyLimit2 { get; set; }
        public string LimitBasis2 { get; set; }
        public decimal? TaxRate { get; set; }
        public string NoReinstatements { get; set; }
        public DateTime? DebitSentOn { get; set; }
        public int? ExportedToUW { get; set; }
        public int? OriginalTransactionId { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? PaidToCfcOn { get; set; }
        public DateTime? PaidToBabOn { get; set; }
        public decimal? FirstPartyLimit { get; set; }
        public int? ClientLocationId { get; set; }
        public int? CurrencyId { get; set; }
        public string Validated { get; set; }
        public string StateOfFiling { get; set; }
        public string BrokasurePolicyNumber { get; set; }
        public int? SettlementCurrencyId { get; set; }
        public decimal? SettlementExchangeRate { get; set; }
        public string ExtTransRef { get; set; }
        public bool IsXS { get; set; }
        public string UnderlyingPolicyNumber { get; set; }
        public bool BrokasureManuallyReconciled { get; set; }
        public int? EnquiryId { get; set; }
        public decimal? CfcShare { get; set; }
        public bool? IsNewBusiness { get; set; }
        public bool IsTriaPurchased { get; set; }
        public ICollection<WebApiDto.Dto.Transactions.TransactionTax> TransactionTaxes { get; set; }
        public ICollection<WebApiDto.Dto.Transactions.TransactionCommission> TransactionCommissions { get; set; }
        public Currency Currency { get; set; }
        public bool? IsDirectBilling { get; set; }
    }
}
