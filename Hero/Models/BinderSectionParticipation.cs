using WebApiDto.Attributes;
using System.Collections.Generic;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class BinderSectionParticipation
    {
        public string BinderDescription { get; set; }
        public string SectionShortCode { get; set; }
        public string BinderYear { get; set; }
        public int? SectionId { get; set; }
        public ICollection<Carrier> Carriers { get; set; }
    }
}
