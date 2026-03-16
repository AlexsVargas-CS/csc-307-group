import { Router } from "express";

import {
  listFilms,
  lookupFilm,
} from "../controllers/rating.controller.js";

const router = Router();

router.get("/", listFilms);
router.get("/lookup", lookupFilm);

export default router;
