using Newtonsoft.Json;

namespace Hero.Models
{
    public class ActivitySearchResponse
    {
        [JsonProperty("activityCode")]
        public string ActivityCode { get; set; }
        [JsonProperty("activityName")]
        public string ActivityName { get; set; }
        [JsonProperty("activityPath")]
        public string ActivityPath { get; set; }
        [JsonProperty("searchableTerm")]
        public string SearchableTerm { get; set; }
    }
}
