using WebApiDto.Attributes;

namespace Hero.Models
{

    [ExportToTypeScript]
    public class PolicySearchResult
    {
        public Policy Policy { get; set; } 
    }
}