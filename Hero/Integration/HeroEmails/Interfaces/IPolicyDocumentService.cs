using Hero.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hero.Integration.HeroEmails.Interfaces
{
    public interface IPolicyDocumentService
    {
        Task<ICollection<FileData>> GetPolicyRelatedDocumentsAsync(string policyNumber);
    }
}
