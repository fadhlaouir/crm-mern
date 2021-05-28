var mongoose = require('mongoose');
var Schema = mongoose.Schema;

contactSchema = new Schema({
        firstName: String,
        lastName: String,
        email: String,
        phone: Number,
        company: String,
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
    contact = mongoose.model('contact', contactSchema);

module.exports = contact;