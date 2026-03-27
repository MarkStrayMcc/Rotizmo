using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Data.Tables;
using System.Text.Json;
using Hero.Models.Storage;

namespace Hero.Integration.BlobStorage
{
    public class StorageService : IStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly TableClient _multiplePropertyBusinessLinesTableClient;

        public StorageService(BlobServiceClient blobServiceClient, TableClient multiplePropertyBusinessLinesTableClient)
        {
            _blobServiceClient = blobServiceClient;
            _multiplePropertyBusinessLinesTableClient = multiplePropertyBusinessLinesTableClient;
        }
        public async Task<BlobDownloadStreamingResult?> GetBlob(string containerName, string blobName)
        {
            var blobContainer = _blobServiceClient.GetBlobContainerClient(containerName);
            var blobContainerExists = blobContainer.Exists();
            if (!blobContainerExists)
            {
                return null;
            }

            var blob = blobContainer.GetBlobClient(blobName);
            var blobExists = blob.Exists();
            if (!blobExists)
            {
                return null;
            }

            var blobContent = await blob.DownloadStreamingAsync();

            return blobContent.Value;
        }


        public async Task<MultiplePropertyBusinessLines> GetMultiplePropertyBusinessLineProducts(string businessLineCode)
        {
            var result = await _multiplePropertyBusinessLinesTableClient.GetEntityIfExistsAsync<MultiplePropertyBusinessLinesEntity>(businessLineCode, businessLineCode);
            return result.HasValue ? JsonSerializer.Deserialize<MultiplePropertyBusinessLines>(result.Value.Products, new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }) ?? new MultiplePropertyBusinessLines() : new MultiplePropertyBusinessLines();
        }
    }
}
