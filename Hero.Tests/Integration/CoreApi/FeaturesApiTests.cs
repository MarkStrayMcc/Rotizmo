using Hero.Infrastructure;
using Hero.Integration.CoreApi;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.FeatureManagement;

namespace Hero.Tests.Integration.CoreApi;

[TestFixture]
public class FeaturesApiTests
{
    [Test]
    public Task ShouldCallAzureFeatureManagerOnly()
    {
        // Arrange
        var configurationRoot = Substitute.For<IConfigurationRoot>();
        var identityHelper = Substitute.For<IIdentityHelper>();
        var httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        var featureManager = Substitute.For<IFeatureManager>();
        featureManager.IsEnabledAsync(Arg.Any<string>()).Returns(true);
        
        // Act
        var subject = new FeaturesApi(configurationRoot, identityHelper, featureManager, httpContextAccessor);

        // Assert
        Assert.DoesNotThrowAsync(() => subject.IsFeatureActive("HERO_IsBrokerFeeEnabled", "DAN", 0));
        identityHelper.DidNotReceive().GetUserEmail(Arg.Any<string>());
        return Task.CompletedTask;
    }
    
    [Test]
    public Task ShouldThrowExceptionWhenAzureFeatureManagerReturnFalse()
    {
        // Arrange
        var configurationRoot = Substitute.For<IConfigurationRoot>();
        var identityHelper = Substitute.For<IIdentityHelper>();
        var httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        var featureManager = Substitute.For<IFeatureManager>();
        featureManager.IsEnabledAsync(Arg.Any<string>()).Returns(false);
        
        // Act
        var subject = new FeaturesApi(configurationRoot, identityHelper, featureManager, httpContextAccessor);

        // Assert
        Assert.ThrowsAsync<InvalidOperationException>(() => subject.IsFeatureActive("HERO_IsBrokerFeeEnabled", "DAN", 0));
        identityHelper.Received(1).GetUserEmail(Arg.Any<string>());
        return Task.CompletedTask;
    }    
}