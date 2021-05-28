var mongoose = require('mongoose');
var Schema = mongoose.Schema;

quoteSchema = new Schema({
        client: String,
        total: Number,
        Reduction: Number,
        Status: String,
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
    quote = mongoose.model('quote', quoteSchema);

module.exports = quote;