import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Message from "../models/Message.js";

const connections = {}; // store SSE connections

// SSE Controller
export const sseController = async (req, res) => {
  const { userId } = req.params;
  console.log("New Client connected:", userId);

  // set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // save connection
  connections[userId] = res;

  // initial message
  res.write(`data: Connected to SSE stream\n\n`);

  // cleanup when client disconnects
  req.on("close", () => {
    delete connections[userId];
    console.log("Client Disconnected:", userId);
  });
};

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth(); // from protect middleware
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (message_type === "image") {
      const fileBuffer = fs.readFileSync(image.path);
      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: image.originalname,
      });

      media_url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    // fetch populated message
    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id",
    );

    // push via SSE if recipient is connected
    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messageWithUserData)}\n\n`,
      );
    }

    return res.json({ success: true, message });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ createdAt: -1 });

    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId },
      { seen: true },
    );

    return res.json({ success: true, messages });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Recent messages
export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const messages = await Message.find({ to_user_id: userId })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 });

    return res.json({ success: true, messages });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
