using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class Syndicate
    {
        public string ShortName { get; set; }
        public decimal ParticipationPercent { get; set; }
    }
}
