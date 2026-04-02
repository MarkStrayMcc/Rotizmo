namespace CFC.CoreApi.BusinessLogicDto.Dto
{
    using System;
    using System.Collections.Generic;

    public class QuoteBindRequest
    {
        public int QuoteId { get; set; }

        public int CfcContactId { get; set; }

        public DateTime InceptionDate { get; set; }

        public DateTime ExpiryDate { get; set; }

        public DateTime ReceivedDate { get; set; }

        public decimal TotalPremium { get; set; }

        public SurplusLine SurplusLineBroker { get; set; }

        public BrokerTeam LocalBroker { get; set; }

        public CommissionInformation CommissionInformation { get; set; }

        public IEnumerable<QuoteSubjectivity> QuoteSubjectivities { get; set; }

        public IEnumerable<PricingInformation> PricingInformation { get; set; }

        public string AustralianBusinessNumber { get; set; }

        public BrokerTeam BrokerTeam { get; set; }

        [Obsolete("IsDirectBilling is deprecated. Please use Payment instead.")]
        public bool? IsDirectBilling { get; set; }

        public Payment Payment { get; set; }

        public string CfcUserEmailAddress { get; set; }

        public virtual ICollection<PolicyLocationPremiums> PolicyLocationPremiums { get; set; }
    }
}
