import { Router } from "express";

import { authenticateUser } from "../auth.js";
import {
  rateFilm,
  removeRating,
  getFilmRatings,
  getMyRating,
  getFilmDimensions,
} from "../controllers/rating.controller.js";

const router = Router();

router.get("/:filmId", getFilmRatings);
router.get(
  "/:filmId/dimensions",
  getFilmDimensions
);
router.get(
  "/:filmId/me",
  authenticateUser,
  getMyRating
);
router.put(
  "/:filmId",
  authenticateUser,
  rateFilm
);
router.delete(
  "/:filmId",
  authenticateUser,
  removeRating
);

export default router;
