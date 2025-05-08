import Event from "../model/event.model.js";
import mongoose from "mongoose";
import User from "../model/user.model.js";

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLatestEvents = async (req, res) => {
  try {
    const events = await Event.find({ published: true })
      .sort({ date: -1 })
      .limit(3)
      .select("title description _id");

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching latest events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const userToken = req.cookies.usertoken;

    if (userToken) {
      res.set("user-logged-in", "true");
    } else {
      res.set("user-logged-in", "false");
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, image, youtubeLink, date, time, published } =
      req.body;

    const newEvent = new Event({
      title,
      description,
      image,
      youtubeLink,
      date,
      time,
      published: published !== undefined ? published : true,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, description, image, youtubeLink, date, time, published } =
      req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        image,
        youtubeLink,
        date,
        time,
        published,
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const eventDate = new Date(event.date);
    if (eventDate < new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot register for past events" });
    }

    if (event.joinedUsers && event.joinedUsers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are already registered for this event" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Event.findByIdAndUpdate(
        eventId,
        { $addToSet: { joinedUsers: userId } },
        { session }
      );

      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { joinedEvents: eventId } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: "Successfully registered for event" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserRegisteredEvents = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const events = await Event.aggregate([
      {
        $match: {
          _id: {
            $in: user.joinedEvents.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          image: 1,
          date: 1,
          time: 1,
          youtubeLink: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching user registered events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelEventRegistration = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.userId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const eventDate = new Date(event.date);
    if (eventDate < new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot cancel registration for past events" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Event.findByIdAndUpdate(
        eventId,
        { $pull: { joinedUsers: userId } },
        { session }
      );

      await User.findByIdAndUpdate(
        userId,
        { $pull: { joinedEvents: eventId } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res
        .status(200)
        .json({ message: "Successfully canceled event registration" });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error canceling event registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};
