using Hero.Infrastructure;
using WebApiDto.Dto;

namespace Hero.Models
{
    public class WordingVersion : ICanBeDropDownData
    {
        public int WordingVersionId { get; set; }

        public string Version { get; set; }

        public int MajorVersion { get; set; }

        public DropDownData ToDropDownData()
        {
            return new DropDownData
            {
                Value = WordingVersionId,
                Text = Version,
                Hidden = null,
                Img = null
            };
        }
    }
}
