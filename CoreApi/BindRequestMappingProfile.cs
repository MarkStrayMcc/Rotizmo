using AutoMapper;
using Cfc.CoreApi.Policy.RequestHandlers.Transactions.Billing;
using Cfc.CoreApi.Policy.Transactions.Billing;
using CFC.CoreApi.WebApi.Dto.Policy.Transactions.Billing;
using ApiDto = CFC.CoreApi.WebApi.Dto;
using Contracts = Cfc.Policy.Contracts.Bind;

namespace CFC.CoreApi.WebApi.Controllers.Policy
{
    public class BindRequestMappingProfile : Profile
    {
        public BindRequestMappingProfile()
        {
            CreateMap<UpdateTransactionBillingRequest, UpdateTransactionBillingCommand>();
            CreateMap<UpdateTransactionBillingRequest.BillingContact, BillingContact>();

            CreateMap<ApiDto.Policy.Bind.BindRequest, Contracts.BindRequest>()
                .ForMember(dest => dest.Subjectivities,
                    o => o.MapFrom(src => src.QuoteSubjectivities));

            CreateMap<ApiDto.Policy.Bind.QuoteSubjectivity, Contracts.Subjectivity>()
                .ForMember(dest => dest.SubjectivityId, 
                    o => o.MapFrom(src => src.Subjectivity.SubjectivityId))
                .ForMember(dest => dest.Text, 
                    o => o.MapFrom(src => src.Subjectivity != null && !string.IsNullOrEmpty(src.Subjectivity.Text) ? src.Subjectivity.Text : src.Text));

            CreateMap<ApiDto.Policy.Bind.CommissionInformation, Contracts.CommissionInformation>();
            CreateMap<ApiDto.Policy.Bind.SurplusLine, Contracts.SurplusLine>();
            CreateMap<ApiDto.Policy.Bind.BrokerTeam, Contracts.BrokerTeam>();
            CreateMap<ApiDto.Policy.Bind.Broker, Contracts.Broker>();
            CreateMap<ApiDto.Policy.Bind.PricingInformation, Contracts.PricingInformation>();
            CreateMap<ApiDto.Policy.Bind.Tag, Contracts.Tag>();
            CreateMap<ApiDto.Policy.Bind.Binder, Contracts.Binder>();
            CreateMap<ApiDto.Policy.Bind.AdditionalInsured, Cfc.Policy.Contracts.AdditionalInsured>();
            CreateMap<ApiDto.Policy.Bind.Payment, Contracts.Payment>();
            CreateMap<ApiDto.Policy.PolicyLocationPremiums, Contracts.PolicyLocationPremiums>();


            CreateMap<Contracts.BindResponse, ApiDto.Policy.Bind.BindResponse>();
            CreateMap<Contracts.BindError, ApiDto.Policy.Bind.BindResponse>();
            CreateMap<Contracts.BindErrorCode, ApiDto.Policy.Bind.BindQuoteErrorCode>();
        }
    }
}