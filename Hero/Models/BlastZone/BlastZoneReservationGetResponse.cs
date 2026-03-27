using System;
using System.Collections.Generic;

namespace Hero.Models.BlastZone
{
    public class BlastZoneReservationGetResponse
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public bool IsRenewable { get; set; } = false;
        public string CapacityStartDate { get; set; }
        public string CapacityEndDate { get; set; }
        public decimal FloatingValue { get; set; } = 0.0m;
        public int FirstLossLimit { get; set; } = 0;
        public List<BlastZoneCapacityRequest> Reservations { get; set; }
    }
}