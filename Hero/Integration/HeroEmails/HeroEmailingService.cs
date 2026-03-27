using Hero.Integration.HeroEmails.Interfaces;
using Hero.Models;
using Hero.Models.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.ApplicationInsights;
using Newtonsoft.Json;

namespace Hero.Integration.HeroEmails
{
    public class HeroEmailingService : IHeroEmailingService
    {
        private readonly IRequestEnrichmentApi _requestEnrichmentApi;
        private readonly IUnderwritingDistributionApi _underwritingDistributionApi;
        private readonly IQuoteDocumentService _quoteDocumentService;
        private readonly IPolicyDocumentService _policyDocumentService;
        private readonly TelemetryClient _telemetryClient;
        private const string _cpaProductCode = "CPA";
        private const string _commissionHtmlKey = "CommissionHtml";

        public HeroEmailingService(IRequestEnrichmentApi requestEnrichmentApi, IUnderwritingDistributionApi underwritingDistributionApi,
            IQuoteDocumentService quoteDocumentService, IPolicyDocumentService policyDocumentService, TelemetryClient telemetryClient)
        {
            _telemetryClient = telemetryClient;
            _requestEnrichmentApi = requestEnrichmentApi;
            _underwritingDistributionApi = underwritingDistributionApi;
            _quoteDocumentService = quoteDocumentService;
            _policyDocumentService = policyDocumentService;
        }

        public async Task<bool> SendQuoteEmailWithCoverHolder(UnderwritingDistributionEmail underwritingDistributionEmail)
        {
            var coverHolderInfo = await _requestEnrichmentApi.GetQuoteCoverHolderInfo(underwritingDistributionEmail.QuoteId);

            var getCoverHolderEmailTemplateTask = _requestEnrichmentApi.GetEmailTemplate((int)underwritingDistributionEmail.Email.EmailType, coverHolderInfo);
            var getEmailMergeFieldsTask = _requestEnrichmentApi.GetQuoteEmailMergeFields(underwritingDistributionEmail);
            var getQuoteRelatedDocumentsTask = _quoteDocumentService.GetQuoteRelatedDocumentsAsync(underwritingDistributionEmail.QuoteUid);

            List<Task> taskList = new()
            {
                getCoverHolderEmailTemplateTask,
                getEmailMergeFieldsTask,
                getQuoteRelatedDocumentsTask
            };

            await Task.WhenAll(taskList);

            var coverHolderEmailTemplate = await getCoverHolderEmailTemplateTask;
            var emailMergeFields = await getEmailMergeFieldsTask;
            var quoteRelatedDocuments = await getQuoteRelatedDocumentsTask;

            List<Task<List<QuoteFileData>>> additionalQuoteDocumentTaskList = await GetAdditionalQuoteDocumentsList(underwritingDistributionEmail);

            var additionalQuoteDocuments = await Task.WhenAll(additionalQuoteDocumentTaskList);

            emailMergeFields.Add("CustomBody", underwritingDistributionEmail.Email.EmailBody);

            foreach (var mergeField in underwritingDistributionEmail.Email.MergeFields)
            {
                if (!emailMergeFields.ContainsKey(mergeField.Key))
                {
                    emailMergeFields.Add(mergeField.Key, mergeField.Value);
                }
            }

            var attachments = GetAttachments(underwritingDistributionEmail.Email.DataAttachments, underwritingDistributionEmail.Email.ServerSideAttachments,
                quoteRelatedDocuments, additionalQuoteDocuments);

            if (additionalQuoteDocuments?.Any() == true)
            {
                attachments = ReArrangeAttachmentsByQuotes(attachments);
            }

            var email = new Email
            {
                EmailType = underwritingDistributionEmail.Email.EmailType,
                Sender = underwritingDistributionEmail.Email.Sender,
                To = underwritingDistributionEmail.Email.To,
                Cc = underwritingDistributionEmail.Email.Cc,
                Bcc = underwritingDistributionEmail.Email.Bcc,
                Subject = underwritingDistributionEmail.Email.Subject,
                EmailBody = coverHolderEmailTemplate,
                MergeFields = emailMergeFields,
                DataAttachments = attachments
            };

            LogSendEmail(underwritingDistributionEmail, email, "SendQuoteEmailWithCoverHolder_UnderwritingDistributionEmail");
            return await _underwritingDistributionApi.SendEmail(email);
        }

        private List<FileData> ReArrangeAttachmentsByQuotes(List<FileData> attachments)
        {
            var quotes = new List<FileData>();
            var otherAttachments = new List<FileData>();

            foreach (var attachment in attachments)
            {
                if (string.Equals(attachment.Type, "Quote", StringComparison.OrdinalIgnoreCase))
                {
                    quotes.Add(attachment);
                }
                else
                {
                    otherAttachments.Add(attachment);
                }
            }
            quotes.AddRange(otherAttachments);
            return quotes;
        }

        public async Task<bool> SendPolicyEmailWithCoverHolder(UnderwritingDistributionEmail underwritingDistributionEmail)
        {
            var coverHolderInfo = await _requestEnrichmentApi.GetQuoteCoverHolderInfo(underwritingDistributionEmail.QuoteId);

            var getEmailMergeFieldsTask = _requestEnrichmentApi.GetQuoteEmailMergeFields(underwritingDistributionEmail);
            var getCoverHolderEmailTemplateTask = _requestEnrichmentApi.GetEmailTemplate((int)underwritingDistributionEmail.Email.EmailType, coverHolderInfo);
            var getPolicyDocumentsTask = _policyDocumentService.GetPolicyRelatedDocumentsAsync(underwritingDistributionEmail.PolicyNumber);

            List<Task> taskList = new()
            {
                getCoverHolderEmailTemplateTask,
                getPolicyDocumentsTask,
                getEmailMergeFieldsTask
            };

            await Task.WhenAll(taskList);

            var coverHolderEmailTemplate = await getCoverHolderEmailTemplateTask;
            var policyRelatedDocuments = await getPolicyDocumentsTask;
            var emailMergeFields = await getEmailMergeFieldsTask;

            var attachments = GetAttachments(underwritingDistributionEmail.Email.DataAttachments, underwritingDistributionEmail.Email.ServerSideAttachments,
                policyRelatedDocuments, null);

            var encryptionAttachments = FetchDocumentsForEncryption(attachments, underwritingDistributionEmail.Email.ServerSideAttachments);
            var encryptedPolicyDocuments = await _requestEnrichmentApi.GetEncryptedDocuments(new EncryptDocumentRequest
            {
                ProductName = underwritingDistributionEmail.ProductCode,
                CountryIsoCode = underwritingDistributionEmail.CountryIsoCode,
                BrokerId = underwritingDistributionEmail.BrokerId,
                PolicyNumber = underwritingDistributionEmail.PolicyNumber,
                ClientUid = underwritingDistributionEmail.ClientUid,
                PolicyDocuments = encryptionAttachments.ToList()
            });
            if (encryptedPolicyDocuments != null && encryptedPolicyDocuments.Any())
            {
                emailMergeFields.Add("EncryptedDocumentsHtml", PolicyMergeField.EncryptedDocumentsHtml);
                emailMergeFields.Add("EncryptedDocumentsKey", encryptedPolicyDocuments.First().Key);
                foreach (var item in encryptedPolicyDocuments)
                {
                    var attachment = attachments.FirstOrDefault(x => x.Name == item.FileName);
                    if (attachment != null && !string.IsNullOrEmpty(attachment.Name))
                    {
                        attachment.Data = Convert.ToBase64String(item.FileData);
                    }
                }
            }
            else
            {
                emailMergeFields.Add("EncryptedDocumentsHtml", "");
            }

            emailMergeFields.Add("PolicyNumber", underwritingDistributionEmail.PolicyNumber);
            emailMergeFields.Add("CustomBody", underwritingDistributionEmail.Email.EmailBody);

            GetCommissionMergeField(underwritingDistributionEmail.ProductCode, emailMergeFields);

            foreach (var mergeField in underwritingDistributionEmail.Email.MergeFields)
            {
                if (!emailMergeFields.ContainsKey(mergeField.Key))
                {
                    emailMergeFields.Add(mergeField.Key, mergeField.Value);
                }
            }

            var email = new Email
            {
                EmailType = underwritingDistributionEmail.Email.EmailType,
                Sender = underwritingDistributionEmail.Email.Sender,
                To = underwritingDistributionEmail.Email.To,
                Cc = underwritingDistributionEmail.Email.Cc,
                Bcc = underwritingDistributionEmail.Email.Bcc,
                Subject = underwritingDistributionEmail.Email.Subject,
                EmailBody = coverHolderEmailTemplate,
                MergeFields = emailMergeFields,
                DataAttachments = attachments
            };

            LogSendEmail(underwritingDistributionEmail, email, "SendPolicyEmailWithCoverHolder_UnderwritingDistributionEmail");
            return await _underwritingDistributionApi.SendEmail(email);
        }

        private void LogSendEmail(UnderwritingDistributionEmail underwritingDistributionEmail, Email email, string telemetryEventName)
        {
            var jsonUnderwritingDistributionEmailRequest = JsonConvert.SerializeObject(underwritingDistributionEmail);
            var telemetryProperties = new Dictionary<string, string>
            {
                { "To", string.Join(";", email.To.Select(m => m.Email)) },
                { "Cc", string.Join(";", email.Cc.Select(m => m.Email)) },
                { "Bcc", string.Join(";", email.Bcc.Select(m => m.Email)) },
                { "Subject", email.Subject },
                { "EmailType", email.EmailType.ToString() },
                { "QuoteId", underwritingDistributionEmail.QuoteId.ToString() },
                { "QuoteUid", underwritingDistributionEmail.QuoteUid.ToString() },
                { "DataAttachmentsCount", email.DataAttachments?.Count.ToString() ?? "0" },
                { "ServerSideAttachmentsCount", underwritingDistributionEmail.Email.ServerSideAttachments?.Count.ToString() ?? "0" },
                { "DataAttachmentsNames", string.Join(";", email.DataAttachments?.Select(a => a.Name) ?? Array.Empty<string>()) },
                { "ServerSideAttachmentsNames", string.Join(";", underwritingDistributionEmail.Email.ServerSideAttachments?.Select(a => a.FileName) ?? Array.Empty<string>()) },
                { "UnderwritingDistributionEmailRequest", jsonUnderwritingDistributionEmailRequest }
            };
            _telemetryClient.TrackEvent(telemetryEventName, telemetryProperties);
        }

        private async Task<List<Task<List<QuoteFileData>>>> GetAdditionalQuoteDocumentsList(UnderwritingDistributionEmail underwritingDistributionEmail)
        {
            List<Task<List<QuoteFileData>>> additionalQuoteDocumentTaskList = new List<Task<List<QuoteFileData>>>();

            if (underwritingDistributionEmail.QuoteIds != null && underwritingDistributionEmail.QuoteIds.Count > 1)
            {
                var quoteUids = await _requestEnrichmentApi.GetQuoteUids(underwritingDistributionEmail.QuoteIds);

                foreach(var item in underwritingDistributionEmail.QuoteIds)
                {
                    var quoteId = item;
                    var quoteUid = Guid.Empty;
                    if (quoteUids.TryGetValue(quoteId, out quoteUid))
                    {
                        var additionalQuoteDocumentTask = _quoteDocumentService.GetQuoteAdditionalDocumentsAsync(quoteUid);

                        additionalQuoteDocumentTaskList.Add(additionalQuoteDocumentTask);

                    }
                }
            }

            return additionalQuoteDocumentTaskList;
        }

        private static FileData FindAttachment(ICollection<FileData> candidates, ServerSideFileData item)
        {
            var byFullName = candidates.FirstOrDefault(x =>
                string.Equals(x.Name, item.FileName, StringComparison.OrdinalIgnoreCase));

            if (byFullName != null)
                return byFullName;

            if (string.IsNullOrEmpty(item.Reference))
                return null;

            return candidates.FirstOrDefault(x =>
                x.Name != null &&
                x.Name.Contains($"QUOTE {item.Reference}", StringComparison.OrdinalIgnoreCase));
        }

        private List<FileData> GetAttachments(ICollection<FileData> dataAttachments, ICollection<ServerSideFileData> serverAttachments,
            ICollection<FileData> entityRelatedAttachments, List<QuoteFileData>[] additionalDocuments)
        {
            dataAttachments?.ToList().ForEach(a =>
            {
                a.Extension = ".Pdf";

                if (!string.IsNullOrWhiteSpace(a.Data) && a.Data.Contains(","))
                {
                    a.Data = a.Data.Substring(a.Data.IndexOf(",") + 1);
                }
            });

            var allAttachments = new List<FileData>(dataAttachments ?? new List<FileData>());
            var allAttachmentsDictionary = new Dictionary<string, FileData>();
            foreach (var dataAttachment in dataAttachments)
            {
                allAttachmentsDictionary[dataAttachment.Name] = dataAttachment;
            }

            if (serverAttachments != null && entityRelatedAttachments != null)
            {
                foreach (var item in serverAttachments)
                {
                    var attachment = FindAttachment(entityRelatedAttachments, item);
                    if (attachment != null && !string.IsNullOrEmpty(attachment.Name))
                    {
                        attachment.Extension = ".Pdf";
                        allAttachmentsDictionary.TryAdd(attachment.Name, attachment);
                        allAttachments.Add(attachment);
                    }
                }
            }

            if (additionalDocuments != null && additionalDocuments.Any())
            {
                foreach (var innerAdditionalDocuments in additionalDocuments)
                {
                    foreach (var additionalDocument in innerAdditionalDocuments)
                    {
                        if (additionalDocument != null && !string.IsNullOrEmpty(additionalDocument.FileName))
                        {
                            var serverSideFile = serverAttachments.FirstOrDefault(x => x.FileName.Contains(additionalDocument.FileName.ToUpper()));
                            var fileData = new FileData
                            {
                                Name = (serverSideFile != null && !string.IsNullOrWhiteSpace(serverSideFile.FileName)) ? serverSideFile.FileName : additionalDocument.FileName,
                                Data = additionalDocument.Data,
                                Extension = ".Pdf",
                                Type = additionalDocument.Type
                            };
                            allAttachmentsDictionary.TryAdd(fileData.Name, fileData);
                            allAttachments.Add(fileData);
                        }
                    }
                }
            }

            var distinctAttachments = allAttachmentsDictionary.Values.ToList();
            return distinctAttachments;
        }

        private List<FileData> FetchDocumentsForEncryption(ICollection<FileData> attachments, ICollection<ServerSideFileData> serverAttachments)
        {
            var encryptionAttachments = new List<FileData>();
            if (serverAttachments != null && serverAttachments.Any())
            {
                foreach (var item in serverAttachments)
                {
                    var attachment = attachments.FirstOrDefault(x => x.Name == item.FileName);
                    if (attachment != null && !string.IsNullOrEmpty(attachment.Name) &&
                        (item.ServerSideFileType != ServerSideFileType.Custom && item.ServerSideFileType != ServerSideFileType.Wording))
                    {
                        encryptionAttachments.Add(attachment);
                    }
                }
            }
            return encryptionAttachments;
        }

        private static void GetCommissionMergeField(string productCode, IDictionary<string, string> mergeFields)
        {
            var commissionHtml = productCode == _cpaProductCode ? "" : PolicyMergeField.CommissionHtml;
            mergeFields.Add(_commissionHtmlKey, commissionHtml);
        }
    }
}
