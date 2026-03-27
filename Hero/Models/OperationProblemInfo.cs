using WebApiDto.Attributes;

namespace Hero.Models
{
    [ExportToTypeScript]
    public class OperationProblemInfo
    {
        public long? Id { get; set; }

        public string Reason { get; set; }
    }
}
