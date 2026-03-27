namespace Hero.Models.CreatePolicyMta
{
    public class LossPayee
    {
        public string EntityName { get; set; }
        public string ContactEmail { get; set; }
        public string InterestOfEntity { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? AddressLine3 { get; set; }
        public string? City { get; set; }
        public string? Postcode { get; set; }
        public string? County { get; set; }
        public string? StateProvinceIsoCode { get; set; }
        public string? CountryIsoCode { get; set; }
    }
}
