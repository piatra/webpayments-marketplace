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
    destination : String
});

var AssetSchema = {
	id: String,
	type: Array,
	creator: {
		fullName: String
	},
	title: String,
	assetContent: String,
	assetProvider: String,
	signature : Object
};

var ListingSchema = {
	id: String,
	assetId: Schema.Types.ObjectId,
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
	signature: Object
}

module.exports = function (db) {
	var schemes = {};
	var Listing = mongoose.model('Listing', ListingSchema);
	var Asset = mongoose.model('Asset', AssetSchema);
	var User = mongoose.model('User', UserSchema);

	return {
		Listing: Listing,
		Asset: Asset,
		User: User
	};
}