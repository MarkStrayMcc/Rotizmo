namespace Hero.Integration.CoreApi.Interfaces
{
    using Hero.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IBinderSectionParticipationApi
    {
        Task<IEnumerable<BinderSectionParticipation>> GetBinderSectionParticipationLookups();
    }
}
