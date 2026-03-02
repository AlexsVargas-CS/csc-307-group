import express from "express";
import User from "../models/User.js";
import { authenticateUser } from "../auth.js";

const router = express.Router();

router.get("/me", authenticateUser, async (req, res) => {
  return res.status(200).json({ username: req.user.username });
});

router.get("/users/:username", async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).lean();
  if (!user) return res.status(404).send("User not found");

  // Placeholder “profile” data
  return res.status(200).json({
    username: user.username,
    bio: user.bio || "This is a placeholder bio.",
    favoriteGenres: user.favoriteGenres || ["Drama", "Sci-Fi", "Comedy"],
  });
});


//Edit
router.put("/users/:username", authenticateUser, async (req, res) => {
  const { username } = req.params;

  if (req.user.username !== username) {
    return res.status(403).send("Forbidden: cannot edit another user's profile");
  }

  const { bio, favorites } = req.body;

  const updated = await User.findOneAndUpdate(
    { username },
    {
      ...(typeof bio === "string" ? { bio } : {}),
      ...(Array.isArray(favorites) ? { favorites } : {}),
    },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).send("User not found");

  return res.status(200).json({
    username: updated.username,
    bio: updated.bio || "",
    favorites: updated.favorites || [],
  });
});

export default router;