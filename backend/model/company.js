var mongoose = require('mongoose');
var Schema = mongoose.Schema;

companySchema = new Schema({
        name: String,
        address: String,
        zipCode: Number,
        country: String,
        user_id: Schema.ObjectId,
        is_delete: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now
        }
    }),
    company = mongoose.model('company', companySchema);

module.exports = company;