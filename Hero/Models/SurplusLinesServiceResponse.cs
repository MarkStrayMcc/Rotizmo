using System;

namespace Hero.Models
{
    public class SurplusLinesServiceResponse
    {
        public int Key { get; set; }
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Company { get; set; } = null!;
        public string LicenseNumber { get; set; } = null!;
        public string? LicenseStateIsoCode { get; set; }
        public DateTime LicenseExpiryDate { get; set; }
        public string AddressLine1 { get; set; } = null!;
        public string? AddressLine2 { get; set; }
        public string? AddressLine3 { get; set; }
        public string AddressZipCode { get; set; } = null!;
        public string AddressStateIsoCode { get; set; } = null!;
        public DateTime? DeletedOn { get; set; }
        public bool IsVerified { get; set; } = false;
    }
}

