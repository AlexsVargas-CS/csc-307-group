import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import User from "../models/User.js";
import Film from "../models/Film.js";
import Rating from "../models/Rating.js";
import jwt from "jsonwebtoken";
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
    watchlist: user.watchlist || [],
    watchlistVisibility: user.watchlistVisibility || "public",
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
    favoriteMovies: user.favoriteMovies || [],
    watchlistVisibility: user.watchlistVisibility || "public"
  });
});

router.put("/users/:username", authenticateUser, async (req, res) => {
  const { username } = req.params;

  if (req.user.username !== username) {
    return res.status(403).send("Forbidden: cannot edit another user's profile");
  }

  const { bio, favoriteMovies, watchlist, watchlistVisibility } = req.body;

const updated = await User.findOneAndUpdate(
  { username },
  {
    ...(typeof bio === "string" ? { bio } : {}),
    ...(Array.isArray(favoriteMovies)
      ? {
          favoriteMovies: favoriteMovies
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0)
            .slice(0, 5),
        }
      : {}),
    ...(Array.isArray(watchlist)
      ? {
          watchlist: [...new Set(
            watchlist
              .map((id) => Number(id))
              .filter((id) => Number.isInteger(id) && id > 0)
          )],
        }
      : {}),
    ...(typeof watchlistVisibility === "string" &&
    ["public", "private"].includes(watchlistVisibility)
      ? { watchlistVisibility }
      : {}),
  },
  { new: true }
).lean();
  if (!updated) return res.status(404).send("User not found");

  return res.status(200).json({
    username: updated.username,
    profilePictureUrl: updated.profilePictureUrl || "",
    bio: updated.bio || "",
    watchlist: updated.watchlist || [],
    watchlistVisibility: updated.watchlistVisibility || "public",
    favoriteMovies: updated.favoriteMovies || []
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

router.get("/watchlist", authenticateUser, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).lean();
  if (!user) return res.status(404).send("User not found");

  return res.status(200).json({
    watchlist: user.watchlist || [],
  });
});

router.post("/watchlist/:tmdbId", authenticateUser, async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return res.status(400).send("Invalid movie ID");
  }

  const updated = await User.findOneAndUpdate(
    { username: req.user.username },
    {
      $addToSet: { watchlist: tmdbId },
    },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).send("User not found");

  return res.status(200).json({
    watchlist: updated.watchlist || [],
  });
});

router.delete("/watchlist/:tmdbId", authenticateUser, async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return res.status(400).send("Invalid movie ID");
  }

  const updated = await User.findOneAndUpdate(
    { username: req.user.username },
    {
      $pull: { watchlist: tmdbId },
    },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).send("User not found");

  return res.status(200).json({
    watchlist: updated.watchlist || [],
  });
});

router.get("/users/:username/watchlist", async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).lean();
  if (!user) return res.status(404).send("User not found");

  return res.status(200).json({
    username: user.username,
    watchlist: user.watchlist || [],
  });
});

router.put("/watchlist/visibility", authenticateUser, async (req, res) => {
  const { watchlistVisibility } = req.body;

  if (!["public", "private"].includes(watchlistVisibility)) {
    return res.status(400).send("watchlistVisibility must be 'public' or 'private'");
  }

  const updated = await User.findOneAndUpdate(
    { username: req.user.username },
    { watchlistVisibility },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).send("User not found");

  return res.status(200).json({
    watchlistVisibility: updated.watchlistVisibility || "public",
  });
});

router.get("/users/:username/watchlist", async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).lean();
  if (!user) return res.status(404).send("User not found");

  let viewerUsername = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      viewerUsername = decoded.username;
    } catch {
      viewerUsername = null;
    }
  }

  const isOwner = viewerUsername === user.username;
  const isPublic = (user.watchlistVisibility || "public") === "public";

  if (!isPublic && !isOwner) {
    return res.status(403).json({
      message: "This watchlist is private.",
    });
  }

  return res.status(200).json({
    username: user.username,
    watchlist: user.watchlist || [],
    watchlistVisibility: user.watchlistVisibility || "public",
  });
});

router.get("/users/:username/watchlist/details", async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).lean();
  if (!user) return res.status(404).send("User not found");

  let viewerUsername = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      viewerUsername = decoded.username;
    } catch {
      viewerUsername = null;
    }
  }

  const isOwner = viewerUsername === user.username;
  const isPublic = (user.watchlistVisibility || "public") === "public";

  if (!isPublic && !isOwner) {
    return res.status(403).json({
      message: "This watchlist is private.",
    });
  }

  const watchlistIds = (user.watchlist || [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!watchlistIds.length) {
    return res.status(200).json({
      username: user.username,
      watchlistVisibility: user.watchlistVisibility || "public",
      items: [],
    });
  }

  const films = await Film.find({
    tmdbId: { $in: watchlistIds },
    type: "movie",
  }).lean();

  const filmMap = new Map(
    films.map((film) => [Number(film.tmdbId), film])
  );

  const items = await Promise.all(
    watchlistIds.map(async (tmdbId) => {
      const film = filmMap.get(tmdbId);

      if (!film) {
        return {
          tmdbId,
          filmId: null,
          avgRating: null,
          ratingCount: 0,
          communityCategoryAverages: {},
        };
      }

      const communityCategoryAverages = await Rating.aggregateDimensions(film._id);

      return {
        tmdbId,
        filmId: film._id,
        avgRating: film.avgRating ?? null,
        ratingCount: film.ratingCount ?? 0,
        communityCategoryAverages,
      };
    })
  );

  return res.status(200).json({
    username: user.username,
    watchlistVisibility: user.watchlistVisibility || "public",
    items,
  });
});

export default router;