using AutoMapper;
using Hero.Integration.CoreApi.Finance.OutstandingFunds;

namespace Hero.Controllers.Finance.Mapping
{
    public class OutstandingFundsProfile: Profile
    {
        public OutstandingFundsProfile()
        {
            CreateMap<OutstandingFund, Models.OutstandingFund>().ReverseMap();
            CreateMap<OutstandingFundsResponse, Models.OutstandingFundsResponse>().ReverseMap();
            CreateMap<OutstandingFundContribution, Models.OutstandingFundContribution>().ReverseMap();
            CreateMap<OutstandingFundContributionsResponse, Models.OutstandingFundContributionsResponse>().ReverseMap();
            CreateMap<OutstandingFundsTransferRequest, Models.OutstandingFundsTransferRequest>().ReverseMap();
            CreateMap<OutstandingFundsTransferResponse, Models.OutstandingFundsTransferResponse>().ReverseMap();
            CreateMap<OperationProblemInfo, Models.OperationProblemInfo>().ReverseMap();
            CreateMap<MultipleOperationsResultProblemDetails, Models.MultipleOperationsResultProblemDetails>().ReverseMap();
        }
    }
}
