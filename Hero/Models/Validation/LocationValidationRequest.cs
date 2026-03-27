using Hero.Models.Extensions;

namespace Hero.Models.Validation
{
    public class LocationValidationRequest
    {
        public string CountryName { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string City { get; set; }
        public string Postcode { get; set; }
        public string StateProvinceCode { get; set; }
        public string StateProvince { get; set; }
        public string County { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string BuildingUse { get; set; }

        public string ToValidationAddress()
        {
            return ClientLocationExtensions.ToValidationAddress(Address1, City,
                CountryName, Postcode, StateProvince);
        }
    }
}