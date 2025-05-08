import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  youtubeLink: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  published: {
    type: Boolean,
    default: true,
  },
  joinedUsers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
