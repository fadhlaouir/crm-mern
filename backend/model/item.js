var mongoose = require('mongoose');
var Schema = mongoose.Schema;

ItemSchema = new Schema({
        name: String,
        desc: String,
        price: Number,
        image: String,
        quantity: Number,
        quote: {
            type: Schema.Types.ObjectId,
            ref: "quote"
        },
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
    item = mongoose.model('item', ItemSchema);

module.exports = item;