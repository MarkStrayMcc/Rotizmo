using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Hero.Integration.CoreApi.Interfaces;
using Microsoft.AspNetCore.Http;
using WebApiDto.Dto;
using WebApiDto.Enum;

namespace Hero.Integration.CoreApi
{
    public class SubjectivityApi : BaseApi, ISubjectivityApi
    {
        private readonly string _subjectivityUrl;
        private string _defaultSubjectivities;
        
        public SubjectivityApi(IConfigurationRoot configuration, IHttpContextAccessor httpContextAccessor) : base(configuration, httpContextAccessor)
        {
            _subjectivityUrl = _configuration["CoreApi:Subjectivity"];
            _defaultSubjectivities = _configuration["CoreApi:DefaultSubjectivities"];
        }

        public async Task<List<SubjectivityList>> GetAsync(int? productId, int? languageId, int? countryId, bool isAdmitted, int? surplusLineBrokerId)
        {
            var filter = new SubjectivityFilterParameters()
            {
                ProductId = productId,
                LanguageId = languageId,
                CountryId = countryId,
                IsAdmitted = isAdmitted,
                SurplusLineBrokerId = surplusLineBrokerId,
                AuthState = SubjectivityAuthorisationState.Authorised
            };
            return await PostAsyncTyped<SubjectivityFilterParameters, List<SubjectivityList>>($"{_subjectivityUrl}", filter);
        }

        public async Task<List<Subjectivity>> GetDefaultSubjectivityAsync(Guid draftQuoteId)
        {
            _defaultSubjectivities = $"{_defaultSubjectivities}/{draftQuoteId}";
            return await GetAsyncTyped<List<Subjectivity>>(_defaultSubjectivities);
        }

        public async Task<List<int>> GetAllDefaultSubjectivitiesIdsAsync()
        {
            //these should come from the coreapi,are are all the defaults subjectivities IDs
            var result = new List<int>()
            {
                1, 11, 21, 23, 7297, 34936, 120522, 131245
            };

            return await Task.Run(() => result);
        }
    }
}
