import imageKit from "../configs/imageKit.js";
import { inngest } from "../inngest/index.js";
import Connenction from "../models/Connection.js";
import Connection from "../models/Connection.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import fs from "fs";

//get userData  data from userId
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// update user data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);

    !username && (username = tempUser.username);
    if (tempUser.username !== username) {
      const user = await User.findOne({ username });
      if (user) {
        username = tempUser.username;
      }
    }
    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };
    const profile = req.files.profile && req.files.profile[0];
    const cover = req.files.cover && req.files.cover[0];

    if (profile) {
      //convert image to buffer
      const buffer = fs.readFileSync(profile.path);
      //upload image to imagekit
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      //generate the image url endpoint
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "512" },
        ],
      });
      updatedData.profile_picture = url;
    }

    if (cover) {
      //cobver the image to buffer
      const buffer = fs.readFileSync(cover.path);

      //upload image to imagekit
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      //geting the url of stored image form imagekit
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
      updatedData.cover_photo = url;
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });
    return res.json({
      success: true,
      updatedUser,
      message: "Profile Updated SuccessFully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//find users using email location name username
export const discoverUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const { input } = req.body;
    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });
    const filteredUsers = allUsers;
    return res.json({ success: true, filteredUsers });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// follow user
export const followUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // ✅ Ensure ObjectId comparison is consistent
    const alreadyFollowing = user.following.some(
      (f) => f.toString() === id.toString(),
    );
    if (alreadyFollowing) {
      return res.json({
        success: false,
        message: "You are already following this user",
      });
    }

    user.following.push(toUser._id);
    await user.save();

    // only add if not already in followers
    const alreadyFollower = toUser.followers.some(
      (f) => f.toString() === userId.toString(),
    );
    if (!alreadyFollower) {
      toUser.followers.push(user._id);
      await toUser.save();
    }

    return res.json({ success: true, message: "Followed successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // ✅ remove properly using ObjectId string compare
    user.following = user.following.filter(
      (f) => f.toString() !== id.toString(),
    );
    await user.save();

    toUser.followers = toUser.followers.filter(
      (f) => f.toString() !== userId.toString(),
    );
    await toUser.save();

    return res.json({ success: true, message: "You have unfollowed the user" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot connect with yourself",
      });
    }

    // Rate-limit: max 20 requests per day
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({
      from_user_id: userId,
      createdAt: { $gt: last24Hours },
    });
    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message:
          "You have sent more than 20 connection requests in the last 24 hours",
      });
    }

    // Check if connection already exists (either direction)
    let connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (!connection) {
      // ✅ No existing connection → create new pending request
      const newConnection = await Connection.create({
        from_user_id: userId,
        to_user_id: id,
        status: "pending",
      });

      await inngest.send({
        name: "app/connection-request",
        data: { connectionId: newConnection._id },
      });

      return res.json({
        success: true,
        message: "Connection Request Sent Successfully",
      });
    }

    // ✅ If already accepted
    if (connection.status === "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user",
      });
    }

    // ✅ If the other user already sent a request → auto accept
    if (
      connection.status === "pending" &&
      String(connection.to_user_id) === String(userId)
    ) {
      connection.status = "accepted";
      await connection.save();

      return res.json({
        success: true,
        message: "Connection request accepted automatically",
        acceptedUser: await User.findById(id),
      });
    }

    // ✅ Otherwise still pending
    return res.json({ success: false, message: "Connection request Pending" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// get user connections
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();

    // Fetch user with populated fields
    const user = await User.findById(userId).populate(
      "connections followers following",
    );

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Pending connections: first resolve query, then map
    const pendingConnectionsDocs = await Connection.find({
      to_user_id: userId,
      status: "pending",
    }).populate("from_user_id");

    const pendingConnections = pendingConnectionsDocs.map(
      (connection) => connection.from_user_id,
    );

    res.json({
      success: true,
      connections: user.connections || [],
      followers: user.followers || [],
      following: user.following || [],
      pendingConnections,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//accept connection request
// accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth(); // logged-in user
    const { id } = req.body; // id = requester

    // find the connection request (from -> requester, to -> logged-in user)
    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
      status: "pending",
    });

    if (!connection) {
      return res.json({ success: false, message: "No pending request found" });
    }

    // add each other to connections list
    const user = await User.findById(userId);
    const toUser = await User.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // prevent duplicates
    if (!user.connections.includes(id)) {
      user.connections.push(id);
    }
    if (!toUser.connections.includes(userId)) {
      toUser.connections.push(userId);
    }

    await user.save();
    await toUser.save();

    // update connection request status
    connection.status = "accepted";
    await connection.save();

    return res.json({
      success: true,
      message: "Connection accepted successfully",
      acceptedUser: {
        _id: toUser._id,
        full_name: toUser.full_name,
        username: toUser.username,
        profile_picture: toUser.profile_picture,
        bio: toUser.bio,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// get user profiles
export const getUserProfiles = async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await User.findById(profileId);
    if (!profile) {
      return res.json({ success: false, message: "Profile Not Found" });
    }
    const posts = await Post.find({ user: profileId }).populate("user");
    return res.json({ success: true, profile, posts });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
