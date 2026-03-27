using System;
using System.Collections.Generic;

namespace Hero.Models.BlastZone
{
    public class BatchBlastZoneCreateResult
    {
        public Guid Id { get; set; }
        public List<BlastZoneReservation> Reservations { get; set; }
    }
}
