const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    password: String,
}, { timestamps: true });


const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
