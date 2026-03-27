using System;
using System.Collections.Generic;

namespace Hero.Models.BlastZone
{
    public class BatchBlastZoneCapacityCheck
    {
        public string CapacityStartDate { get; set; }
        public string CapacityEndDate { get; set; }
        public long FloatingValue { get; set; }
        public long FirstLossLimit { get; set; }
        public List<BlastZoneCapacityRequest> Properties { get; set; }
        public Guid? OriginalGroupId { get; set; }
    }
}
