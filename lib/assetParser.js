// parses an asset into nice human readable text
module.exports = function (asset, listing) {
  
  return {
    title: asset.title,
    provider: asset.assetProvider.split('/').pop(),
    validity: {
      from: asset.listingRestrictions.validFrom,
      to: asset.listingRestrictions.validUntil
    }
  }


}
