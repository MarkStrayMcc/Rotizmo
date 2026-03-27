using Azure.Storage.Blobs.Models;
using Hero.Models.Storage;

namespace Hero.Integration.BlobStorage
{
    public interface IStorageService
    {
        Task<BlobDownloadStreamingResult?> GetBlob(string containerName, string blobName);

        Task<MultiplePropertyBusinessLines> GetMultiplePropertyBusinessLineProducts(string businessLineCode);
    }
}
