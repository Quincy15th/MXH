// inngest/index.js
import { Inngest } from "inngest";
import connectDB from "../configs/db.js";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";

export const inngest = new Inngest({
  id: "pingup-app",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    console.log("📥 clerk/user.created payload:", event.data);

    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    let username =
      email_addresses?.[0]?.email_address?.split("@")?.[0] ||
      `user_${id.slice(-6)}`;

    // ensure unique username
    const exists = await User.findOne({ username });
    if (exists) username = `${username}${Math.floor(Math.random() * 10000)}`;

    try {
      await User.create({
        _id: id,
        email: email_addresses[0].email_address,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
        username,
      });
      console.log("✅ User created in DB:", id);
    } catch (err) {
      console.error("❌ Error creating user:", err);
      // Helpful for unique constraint collisions
      if (err?.code === 11000) {
        console.error("Duplicate key error on username or _id");
      }
      throw err;
    }
  },
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB();
    console.log("📥 clerk/user.updated payload:", event.data);

    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const updated = {
      email: email_addresses?.[0]?.email_address,
      full_name: `${first_name} ${last_name}`,
      profile_picture: image_url,
    };

    try {
      await User.findByIdAndUpdate(id, updated, { new: true });
      console.log("✅ User updated in DB:", id);
    } catch (err) {
      console.error("❌ Error updating user:", err);
      throw err;
    }
  },
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    console.log("📥 clerk/user.deleted payload:", event.data);

    const { id } = event.data;
    try {
      await User.findByIdAndDelete(id);
      console.log("✅ User deleted from DB:", id);
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      throw err;
    }
  },
);

// inngest function to send a reminder when a new connection request is send
const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-request-reminder" },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;

    await step.run("send-connection-request-mail", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user-id",
      );

      const subject = `👋 New Connection Request`;
      const body = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; color: #1f2937;">
    <h2 style="color: #4f46e5; text-align: center; font-size: 22px;">👋 Hi ${connection.to_user_id.full_name},</h2>
    
    <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">
      You have a new <strong style="color:#111827;">connection request</strong> from 
      <span style="color: #4f46e5; font-weight: bold;">${connection.from_user_id.full_name}</span> 
      (<span style="color:#6b7280;">@${connection.from_user_id.username}</span>).
    </p>

    <p style="margin-top: 20px; font-size: 16px;">
      Click the button below to <strong>accept</strong> or <strong>reject</strong> this request:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/connections" 
         style="background: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
        View Connection Request
      </a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      Thanks,<br/>
      <span style="color: #111827; font-weight: bold;">PingUp (Subharthy)</span> – Stay Connected ✨
    </p>
  </div>
`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });
    });

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);

    await step.run("send-connection-request-reminder", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user-id",
      );

      if (connection.status === "accepted") {
        return { message: "Already Accepted" };
      }
      const subject = `👋 New Connection Request`;
      const body = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; color: #1f2937;">
    <h2 style="color: #4f46e5; text-align: center; font-size: 22px;">👋 Hi ${connection.to_user_id.full_name},</h2>
    
    <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">
      You have a new <strong style="color:#111827;">connection request</strong> from 
      <span style="color: #4f46e5; font-weight: bold;">${connection.from_user_id.full_name}</span> 
      (<span style="color:#6b7280;">@${connection.from_user_id.username}</span>).
    </p>

    <p style="margin-top: 20px; font-size: 16px;">
      Click the button below to <strong>accept</strong> or <strong>reject</strong> this request:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/connections" 
         style="background: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
        View Connection Request
      </a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      Thanks,<br/>
      <span style="color: #111827; font-weight: bold;">PingUp (Subharthy)</span> – Stay Connected ✨
    </p>
  </div>
`;

      await sendEmail({
        to: connection.to_user_id.email,
        subject,
        body,
      });
    });
    return { message: "Reminder Send" };
  },
);

// inngest function to delete story after 24 hours
const deleteStory = inngest.createFunction(
  {
    id: "delete-old-stories",
  },
  {
    cron: "TZ=Asia/Kolkata 0 * * * *", // runs every hour at minute 0
  },
  async ({ step }) => {
    try {
      // Connect to the database
      await connectDB();

      // Calculate cutoff date (24 hours ago)
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Delete all stories older than 24 hours
      const result = await Story.deleteMany({ createdAt: { $lt: cutoff } });

      console.log(`Deleted ${result.deletedCount} old stories`);

      return { message: `Deleted ${result.deletedCount} old stories` };
    } catch (error) {
      console.error("Error deleting old stories:", error);
      throw error;
    }
  },
);

// send notification of unseen messages
const sendNotificationOfUnseenMessages = inngest.createFunction(
  { id: "send-unseen-messages-notification" },
  { cron: "TZ=Asia/Kolkata 0 9 * * *" },

  async ({ step }) => {
    const messages = await Message.find({ seen: false }).populate("to_user_id");
    const unseenCount = {};

    messages.map((message) => {
      unseenCount[message.to_user_id._id] =
        (unseenCount[message.to_user_id._id] || 0) + 1;
    });
    for (const userId in unseenCount) {
      const user = await User.findById(userId);
      const subject = `You habe ${unseenCount[userId]} unseen messages`;
      const body = `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f9f9f9; padding: 40px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px;">
      
      <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">
        Hello, ${user.full_name} 👋
      </h2>
      
      <p style="font-size: 16px; line-height: 1.6; text-align: center;">
        You have <strong style="color: #e74c3c;">${unseenCount[userId]}</strong> unseen messages.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/messages" 
           style="display: inline-block; background: #3498db; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">
          View Messages
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; line-height: 1.6; text-align: center;">
        Thanks,<br/>
        <strong>Pingup (Subharthy)</strong> – Stay Connected
      </p>
      
    </div>
  </div>
`;

      await sendEmail({
        to: user.email,
        subject,
        body,
      });
      return { message: "Notification Sent" };
    }
  },
);

export const functions = [
  deleteStory,
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendNewConnectionRequestReminder,
  sendNotificationOfUnseenMessages,
];
