import { Inngest } from "inngest";
import User from "../models/User";
// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-MXH" });

//inngest function to save user data

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_address, image_url } = event.data;
    let username = email_address[0].email_address.split("@")[0];
  },
);
// Create an empty array where we'll export future Inngest functions
export const functions = [];
