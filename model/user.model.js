import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  sex: {
    type: String,
    enum: ["male", "female"],
  },
  age: {
    type: Number,
  },
  password: {
    type: String,
  },
  joinedEvents: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Event",
  },
  accountBanned: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
