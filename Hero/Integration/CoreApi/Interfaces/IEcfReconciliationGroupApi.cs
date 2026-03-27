using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto.ClaimsFinance;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface IEcfReconciliationGroupApi
    {
        Task<IList<EcfReconciliationGroup>> DeleteEcfReconciliationGroupsAsync(List<int> ecfReconciliationGroupItemIds);

        Task<EcfReconciliationGroup> SaveEcfReconciliationGroupAsync(EcfReconciliationGroupRequest reconciliationGroupRequest);
    }
}