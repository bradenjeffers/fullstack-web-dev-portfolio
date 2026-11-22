const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        fullname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false
        },
        isActive:{
            type: Boolean,
            default: true,
        },
        createdTs: {
            type: Date,
            default: Date.now
        },
        updatedTs: {
            type: Date,
            default: Date.now
        }
    },
    {
        toJSON: {
            // Never serialise the password hash, even if a document is returned by mistake.
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.__v;
                return ret;
            },
        },
    }
);

const UserModel = mongoose.model('Users', userSchema);

module.exports = UserModel;
