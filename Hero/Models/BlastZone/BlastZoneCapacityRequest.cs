using System;

namespace Hero.Models.BlastZone
{
    public class BlastZoneCapacityRequest
    {
        public Location Location { get; set; }
        public long Exposure { get; set; }
        public string CapacityStartDate { get; set; }
        public string CapacityEndDate { get; set; }
        public string ReservationExpiryDate { get; set; }
        public Guid? Id { get; set; }
    }

    public class Location
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}