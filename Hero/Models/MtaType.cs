using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class MtaType
    {
        public string DisplayName { get; set; }
        public string IconName { get; set; }
    }
}