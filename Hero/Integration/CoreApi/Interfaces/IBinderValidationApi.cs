namespace Hero.Integration.CoreApi.Interfaces
{
    using System.Collections.Generic;
    using System.Threading.Tasks;

    using WebApiDto.Dto;

    public interface IBinderValidationApi
    {
        Task<IDictionary<string, IEnumerable<BinderValidationCriteria>>> GetBinderValidationCriterias(
            string draftQuoteId,
            string businessLineCodes);
    }
}
