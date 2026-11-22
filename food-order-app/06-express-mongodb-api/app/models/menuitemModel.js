const mongoose = require('mongoose');

const menuitemSchema = mongoose.Schema({
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    fooditemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    fooditemName: {
        type: String,
        required: true,
    },
    fooditemImage: {
        type: String,
        required: true,
    },
    fooditemPrice: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdTs: {
        type: Date,
        default: Date.now,
    },
    updatedTs: {
        type: Date,
        default: Date.now,
    }
});

const MenuitemModel = mongoose.model('MenuItems', menuitemSchema);

module.exports = MenuitemModel;
