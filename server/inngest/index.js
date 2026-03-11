import { Inngest } from "inngest";
import User from "../models/User.js";
import connectDB from "../configs/db.js"; // sửa path đúng theo project của bạn

export const inngest = new Inngest({ id: "my-MXH" });

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      await connectDB();

      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      let username = email_addresses[0].email_address.split("@")[0];

      const user = await User.findOne({ username });
      if (user) {
        username = username + Math.floor(Math.random() * 10000);
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        full_name: `${first_name || ""} ${last_name || ""}`.trim(),
        profile_picture: image_url,
        username,
      };

      console.log("Creating user:", userData);

      await User.create(userData);

      return { success: true };
    } catch (error) {
      console.error("sync-user-from-clerk error:", error);
      throw error;
    }
  },
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      await connectDB();

      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      const updatedUserData = {
        email: email_addresses[0].email_address,
        full_name: `${first_name || ""} ${last_name || ""}`.trim(),
        profile_picture: image_url,
      };

      await User.findByIdAndUpdate(id, updatedUserData);

      return { success: true };
    } catch (error) {
      console.error("update-user-from-clerk error:", error);
      throw error;
    }
  },
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDB();

      const { id } = event.data;
      await User.findByIdAndDelete(id);

      return { success: true };
    } catch (error) {
      console.error("delete-user-from-clerk error:", error);
      throw error;
    }
  },
);

export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
