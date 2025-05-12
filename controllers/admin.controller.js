import Admin from "../model/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Event from "../model/event.model.js";
import User from "../model/user.model.js";

export const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      username,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        token: token,
      },
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: false,
      path: "/",
      // domain: "localhost",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      admin: {
        id: admin._id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error("Error getting admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventsWithRegisteredUsers = async (req, res) => {
  try {
    const events = await Event.aggregate([
      {
        $match: {
          joinedUsers: { $exists: true, $ne: [] },
        },
      },
      {
        $addFields: {
          registeredCount: { $size: { $ifNull: ["$joinedUsers", []] } },
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          date: 1,
          registeredCount: 1,
        },
      },
    ]);

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events with users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventRegisteredUsers = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.joinedUsers || event.joinedUsers.length === 0) {
      return res.status(200).json([]);
    }

    const users = await User.aggregate([
      {
        $match: {
          _id: { $in: event.joinedUsers },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          age: 1,
          sex: 1,
          accountBanned: 1,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching event users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching all events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
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
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const banUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.accountBanned = !user.accountBanned;
    await user.save();

    res.status(200).json({
      message: user.accountBanned
        ? "User has been banned successfully"
        : "User has been unbanned successfully",
      accountBanned: user.accountBanned,
    });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $addFields: {
          joinedEventsCount: {
            $cond: {
              if: { $isArray: "$joinedEvents" },
              then: { $size: "$joinedEvents" },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          age: 1,
          sex: 1,
          accountBanned: 1,
          joinedEventsCount: 1,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersByEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.joinedUsers || event.joinedUsers.length === 0) {
      return res.status(200).json([]);
    }

    const users = await User.aggregate([
      {
        $match: {
          _id: { $in: event.joinedUsers },
        },
      },
      {
        $addFields: {
          joinedEventsCount: {
            $cond: {
              if: { $isArray: "$joinedEvents" },
              then: { $size: "$joinedEvents" },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          age: 1,
          sex: 1,
          accountBanned: 1,
          joinedEventsCount: 1,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users by event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserWithEvents = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.joinedEvents || user.joinedEvents.length === 0) {
      return res.status(200).json({
        user,
        events: [],
      });
    }

    const events = await Event.find({
      _id: { $in: user.joinedEvents },
    }).sort({ date: -1 });

    res.status(200).json({
      user,
      events,
    });
  } catch (error) {
    console.error("Error fetching user with events:", error);
    res.status(500).json({ message: "Server error" });
  }
};
