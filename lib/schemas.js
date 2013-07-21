var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var UserSchema = new Schema({
	email : String,
	registered : {
		type: String,
		default: false
	},
	publicKeyUrl : String,
    owner : String,
    destination : String,
    username: String
});

var AssetSchema = {
	"@context": String,
	id: String,
	type: Array,
	creator: {
		fullName: String
	},
	title: String,
	assetContent: String,
	assetProvider: String,
	signature : Object,
	description: String,
	userId: String,
	listingId: Schema.Types.ObjectId
};


var ListingSchema = {
	"@context": String,
	id: String,
	userId: String,
	type: Array,
	vendor: String,
	payee: Array,
	payeeRule: Array,
	asset: String,
	assetHash: String,
	license: String,
	licenseHash: String,
	validFrom: Date,
	validUntil: Date,
	signature: Object,
	assetId: Schema.Types.ObjectId,
	userId: String
}

module.exports = function (db) {
	var schemes = {};
	schemes.Listing = mongoose.model('Listing', ListingSchema);
	schemes.Asset = mongoose.model('Asset', AssetSchema);
	schemes.User = mongoose.model('User', UserSchema);

	return schemes;
}