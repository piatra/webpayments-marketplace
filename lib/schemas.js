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
    username: String,
    preferences: {
    	hasBudget: Boolean
    },
    purchases: { type: [String], default: []}
});

var PayeeSchema = {
	id: String,
	type: 'Payee',
	destination: String,
	currency: String,
	payeeGroup: [String],
	payeeRate: Number,
	payeeRateType: 'Percentage',
	payeeApplyType: 'ApplyInclusively',
	payeeApplyGroup: [String],
	minimumAmount: Number,
	comment: String
};

var AssetSchema = {
	"@context": String,
	id: String,
	listingId: String,
	type: Array,
	creator: {
		fullName: String,
		userId: String
	},
	title: String,
	assetContent: String,
	assetFiles: [String],
	assetPreview: [String],
	assetProvider: String,
	signature : Object,
	assetDescription: String,
	listingRestrictions: {
		validFrom: String,
		validUntil: String,
		payee: Object,
		payeeRule: Object
	}
};


var ListingSchema = {
	"@context": String,
	id: String,
	assetId: String,
	userId: String,
	type: Array,
	vendor: String,
	payee: Array,
	payeeRule: Array,
	asset: String,
	assetHash: String,
	_listingHash: String,
	license: String,
	licenseHash: String,
	validFrom: String,
	validUntil: String,
	signature: Object
}

module.exports = function (db) {
	var schemes = {};
	schemes.Listing = mongoose.model('Listing', ListingSchema);
	schemes.Asset = mongoose.model('Asset', AssetSchema);
	schemes.User = mongoose.model('User', UserSchema);

	return schemes;
}