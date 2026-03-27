using System.Collections.Generic;
using System.Threading.Tasks;
using Hero.Models.SubjectivityConfiguration;

namespace Hero.Integration.SubjectivityConfigurationApi;

public interface ISubjectivityConfigurationApi
{
    Task<ICollection<SearchSubjectivitiesResult>> Filter(SearchSubjectivitiesQuery searchSubjectivitiesQuery);
}
