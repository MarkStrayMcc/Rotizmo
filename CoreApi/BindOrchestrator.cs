using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Cfc.CoreApi.Policy.DomainService.AdditionalInsured;
using Cfc.CoreApi.Policy.DomainService.LossPayee;
using Cfc.Policy.Contracts.Bind;

namespace Cfc.CoreApi.Policy.DomainService.Bind
{
    public class BindOrchestrator : IBindOrchestrator
    {
        private readonly IPolicyCreator _policyCreator;
        private readonly IPolicyAdditionalInsuredPersister _policyAdditionalInsuredPersister;
        private readonly IPolicyLossPayeePersister _policyLossPayeePersister;
        private readonly IQuoteAdditionalInsuredRetriever _quoteAdditionalInsuredRetriever;
        private readonly IQuoteLossPayeeRetriever _quoteLossPayeeRetriever;

        public BindOrchestrator(IPolicyCreator policyCreator, IPolicyAdditionalInsuredPersister policyAdditionalInsuredPersister, 
        IQuoteAdditionalInsuredRetriever quoteAdditionalInsuredRetriever, IPolicyLossPayeePersister policyLossPayeePersister, 
        IQuoteLossPayeeRetriever quoteLossPayeeRetriever)
        {
            _policyCreator = policyCreator;
            _policyAdditionalInsuredPersister = policyAdditionalInsuredPersister;
            _quoteAdditionalInsuredRetriever = quoteAdditionalInsuredRetriever;
            _policyLossPayeePersister = policyLossPayeePersister;
            _quoteLossPayeeRetriever = quoteLossPayeeRetriever;
        }
        
        public async Task<BindResponse> Bind(BindRequest bindRequest)
        {
            var policyResponse = await _policyCreator.Create(bindRequest);
            PersistAdditionalInsured(bindRequest.QuoteReference, policyResponse.PolicyNumber);
            PersistLossPayees(bindRequest.QuoteReference, policyResponse.PolicyNumber);

            return policyResponse;
        }

        private void PersistLossPayees(int quoteReference, string policyNumber)
        {
            var lossPayees = _quoteLossPayeeRetriever.Get(quoteReference);
            _policyLossPayeePersister.Persist(lossPayees, policyNumber);
        }

        private void PersistAdditionalInsured(int quoteReference, string policyNumber)
        {
            var additionalInsureds = _quoteAdditionalInsuredRetriever.Get(quoteReference);
            _policyAdditionalInsuredPersister.Persist(additionalInsureds, policyNumber);
        }
    }
}
