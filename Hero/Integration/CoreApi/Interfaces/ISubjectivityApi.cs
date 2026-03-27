using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiDto.Dto;

namespace Hero.Integration.CoreApi.Interfaces
{
    public interface ISubjectivityApi
    {
        Task<List<SubjectivityList>> GetAsync(int? productId, int? languageId, int? countryId, bool isAdmitted, int? surplusLineBrokerId);

        Task<List<Subjectivity>> GetDefaultSubjectivityAsync(Guid draftQuoteId);

        Task<List<int>> GetAllDefaultSubjectivitiesIdsAsync();

    }
}
