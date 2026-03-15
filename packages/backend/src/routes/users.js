import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import User from "../models/User.js";
import { authenticateUser } from "../auth.js";

const router = express.Router();

const uploadDir = "uploads/pfps";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `${req.params.username}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

router.get("/me", authenticateUser, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).lean();
  if (!user) return res.status(404).send("User not found");

  return res.status(200).json({
    username: user.username,
    profilePictureUrl: user.profilePictureUrl || "",
  });
});

router.get("/users/:username", async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).lean();
  if (!user) return res.status(404).send("User not found");

  return res.status(200).json({
    username: user.username,
    profilePictureUrl: user.profilePictureUrl || "",
    bio: user.bio || "This is a placeholder bio.",
    favorites: user.favorites || [],
    // TODO: replace this later with computed most-watched genres from watch history
    mostWatchedGenres: [],
  });
});

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
    profilePictureUrl: updated.profilePictureUrl || "",
    bio: updated.bio || "",
    favorites: updated.favorites || [],
    mostWatchedGenres: [],
  });
});

router.put(
  "/users/:username/pfp",
  authenticateUser,
  upload.single("pfp"),
  async (req, res) => {
    const { username } = req.params;

    if (req.user.username !== username) {
      return res.status(403).send("Forbidden: cannot edit another user's profile");
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.profilePictureUrl) {
      const oldPath = user.profilePictureUrl.startsWith("/")
        ? user.profilePictureUrl.slice(1)
        : user.profilePictureUrl;

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.profilePictureUrl = `/${uploadDir}/${req.file.filename}`;
    await user.save();

    return res.status(200).json({
      profilePictureUrl: user.profilePictureUrl,
    });
  }
);

export default router;