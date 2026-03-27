using Hero.Infrastructure;
using WebApiDto.Dto;

namespace Hero.Models
{
    public class ExcessWordingVersion : ICanBeDropDownData
    {
        public int ExcessWordingVersionId { get; set; }
        public int PrimaryWordingVersionId { get; set; }
        public string Version { get; set; }

        public DropDownData ToDropDownData()
        {
            return new DropDownData
            {
                Value = ExcessWordingVersionId,
                Text = Version,
                Hidden = PrimaryWordingVersionId.ToString(),
                Img = null
            };
        }
    }
}
