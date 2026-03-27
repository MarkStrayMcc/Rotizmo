using System;

namespace Hero.Models.BlastZone
{
    public class  BlastZoneReservation
    {
        public Guid Id { get; set; }
        public bool HasCapacity { get; set; }
        public int AvailableLimit { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}