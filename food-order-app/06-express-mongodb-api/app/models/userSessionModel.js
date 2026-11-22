const mongoose = require('mongoose');

const userSessionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    sessionToken: {
        type: String,
        default: null
    },
    isActive:{
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

const UserSessionModel = mongoose.model('UserSessions', userSessionSchema);

module.exports = UserSessionModel;
