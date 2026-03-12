import { requireAuth } from "@clerk/express";

export const protect = (req, res, next) => {
  try {
    const auth = req.auth(); // 👈 it's an object, not a function

    if (!auth || !auth.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    req.userId = auth.userId; // attach userId to request
    next();
  } catch (error) {
    console.error("❌ Auth error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Authentication failed" });
  }
};
