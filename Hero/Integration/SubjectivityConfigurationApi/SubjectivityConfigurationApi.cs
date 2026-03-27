using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Hero.Models.SubjectivityConfiguration;
using Newtonsoft.Json;

namespace Hero.Integration.SubjectivityConfigurationApi;

public class SubjectivityConfigurationApi : ISubjectivityConfigurationApi
{
    private readonly HttpClient _client;

    public SubjectivityConfigurationApi(HttpClient client)
    {
        _client = client;
    }

    public async Task<ICollection<SearchSubjectivitiesResult>> Filter(SearchSubjectivitiesQuery searchSubjectivitiesQuery)
    {
        var requestUri = new Uri(_client.BaseAddress!, "api/subjectivities/filter");
        var requestContent = new StringContent(JsonConvert.SerializeObject(searchSubjectivitiesQuery), Encoding.UTF8, "application/json");

        var response = await _client.PostAsync(requestUri, requestContent);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(responseContent);
        }

        return JsonConvert.DeserializeObject<ICollection<SearchSubjectivitiesResult>>(responseContent);
    }
}
