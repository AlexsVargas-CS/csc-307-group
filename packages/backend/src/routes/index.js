import { Router } from "express";

import tmdbRoutes from "./tmdb.routes.js";
import usersRoutes from "./users.js";
import ratingRoutes from "./rating.routes.js";
import filmRoutes from "./film.routes.js";

const router = Router();

router.use("/tmdb", tmdbRoutes);
router.use(usersRoutes);
router.use("/ratings", ratingRoutes);
router.use("/films", filmRoutes);

export default router;
