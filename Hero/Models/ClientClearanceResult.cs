using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class ClientClearanceResult
    {
        public bool IsClientClearedForBroker { get; set; }
    }
}
