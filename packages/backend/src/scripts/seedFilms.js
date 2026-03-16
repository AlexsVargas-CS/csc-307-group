import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../config/db.js";
import Film from "../models/Film.js";
import Genre from "../models/Genre.js";
import User from "../models/User.js";
import Rating from "../models/Rating.js";

dotenv.config();

const GENRES = [
  { name: "Drama", tmdbId: 18 },
  { name: "Thriller", tmdbId: 53 },
  { name: "Comedy", tmdbId: 35 },
  { name: "Science Fiction", tmdbId: 878 },
  { name: "Action", tmdbId: 28 },
  { name: "War", tmdbId: 10752 },
  { name: "History", tmdbId: 36 },
  { name: "Music", tmdbId: 10402 },
];

const DEMO_USERS = [
  { username: "demouser", pwd: "demo123" },
  { username: "filmfan42", pwd: "demo123" },
  { username: "cinephile", pwd: "demo123" },
  { username: "moviebuff", pwd: "demo123" },
  { username: "reelcritic", pwd: "demo123" },
];

const CATEGORIES = [
  "acting",
  "cinematography",
  "soundtrack",
  "soundDesign",
  "artDirection",
  "writing",
];

function randomInt(min, max) {
  return (
    Math.floor(Math.random() * (max - min + 1)) +
    min
  );
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(
    () => 0.5 - Math.random()
  );
  return shuffled.slice(0, count);
}

async function seed() {
  await connectToDatabase();
  console.log("Connected to MongoDB");

  // Upsert genres
  const genreDocs = {};
  for (const g of GENRES) {
    const doc = await Genre.findOneAndUpdate(
      { tmdbId: g.tmdbId },
      { name: g.name, tmdbId: g.tmdbId },
      { upsert: true, new: true }
    );
    genreDocs[g.name] = doc._id;
  }
  console.log(
    `Upserted ${GENRES.length} genres`
  );

  // Films data — Best Picture winners
  const films = [
    {
      tmdbId: 872585,
      type: "movie",
      title: "Oppenheimer",
      description:
        "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
      releaseYear: 2023,
      genres: ["Drama", "History"],
      director: "Christopher Nolan",
      cast: [
        "Cillian Murphy",
        "Emily Blunt",
        "Matt Damon",
        "Robert Downey Jr.",
        "Florence Pugh",
      ],
      posterURL:
        "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    },
    {
      tmdbId: 545611,
      type: "movie",
      title:
        "Everything Everywhere All at Once",
      description:
        "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
      releaseYear: 2022,
      genres: [
        "Action",
        "Science Fiction",
        "Comedy",
      ],
      director: "Daniel Kwan",
      cast: [
        "Michelle Yeoh",
        "Stephanie Hsu",
        "Ke Huy Quan",
        "Jamie Lee Curtis",
        "James Hong",
      ],
      posterURL:
        "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
    },
    {
      tmdbId: 776503,
      type: "movie",
      title: "CODA",
      description:
        "As a CODA (Child of Deaf Adults), Ruby is the only hearing person in her deaf family. When the family's fishing business is threatened, Ruby finds herself torn between pursuing her love of music and her fear of abandoning her parents.",
      releaseYear: 2021,
      genres: ["Drama", "Music", "Comedy"],
      director: "Sian Heder",
      cast: [
        "Emilia Jones",
        "Marlee Matlin",
        "Troy Kotsur",
        "Daniel Durant",
        "Eugenio Derbez",
      ],
      posterURL:
        "https://image.tmdb.org/t/p/w500/BzVjmm8l23rPsHT5Zab5r69Y9rJ.jpg",
    },
    {
      tmdbId: 581734,
      type: "movie",
      title: "Nomadland",
      description:
        "A woman in her sixties, after losing everything in the Great Recession, embarks on a journey through the American West, living as a van-dwelling modern-day nomad.",
      releaseYear: 2020,
      genres: ["Drama"],
      director: "Chloe Zhao",
      cast: [
        "Frances McDormand",
        "David Strathairn",
        "Linda May",
        "Swankie",
        "Bob Wells",
      ],
      posterURL:
        "https://image.tmdb.org/t/p/w500/66GUmWpTHgAjyp4aBSXy63PZTiC.jpg",
    },
    {
      tmdbId: 496243,
      type: "movie",
      title: "Parasite",
      description:
        "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
      releaseYear: 2019,
      genres: ["Comedy", "Thriller", "Drama"],
      director: "Bong Joon-ho",
      cast: [
        "Song Kang-ho",
        "Lee Sun-kyun",
        "Cho Yeo-jeong",
        "Choi Woo-shik",
        "Park So-dam",
      ],
      posterURL:
        "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    },
    {
      tmdbId: 490132,
      type: "movie",
      title: "Green Book",
      description:
        "Tony Lip, a bouncer in 1962, is hired to drive pianist Don Shirley on a tour through the Deep South in the days when African Americans had to rely on a guide called The Green Book to find motels and restaurants.",
      releaseYear: 2018,
      genres: ["Drama", "Comedy", "Music"],
      director: "Peter Farrelly",
      cast: [
        "Viggo Mortensen",
        "Mahershala Ali",
        "Linda Cardellini",
        "Dimiter Marinov",
        "Mike Hatton",
      ],
      posterURL:
        "https://image.tmdb.org/t/p/w500/7BsvSuDQuoqhWmU2fL7W2GOcZHU.jpg",
    },
  ];

  // Upsert films
  const filmDocs = [];
  for (const f of films) {
    const genreIds = f.genres
      .map((name) => genreDocs[name])
      .filter(Boolean);
    const doc = await Film.findOneAndUpdate(
      { tmdbId: f.tmdbId, type: f.type },
      {
        tmdbId: f.tmdbId,
        type: f.type,
        title: f.title,
        description: f.description,
        releaseYear: f.releaseYear,
        genreIds,
        director: f.director,
        cast: f.cast,
        posterURL: f.posterURL,
      },
      { upsert: true, new: true }
    );
    filmDocs.push(doc);
    console.log(`  Upserted film: ${f.title}`);
  }

  // Create demo users
  const userDocs = [];
  for (const u of DEMO_USERS) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(
      u.pwd,
      salt
    );
    const doc = await User.findOneAndUpdate(
      { username: u.username },
      { username: u.username, passwordHash },
      { upsert: true, new: true }
    );
    userDocs.push(doc);
  }
  console.log(
    `Created ${DEMO_USERS.length} demo users`
  );

  // Generate random ratings
  let ratingCount = 0;
  for (const film of filmDocs) {
    // Each film gets 3-5 ratings
    const raters = pickRandom(
      userDocs,
      randomInt(3, 5)
    );
    for (const user of raters) {
      const score = randomInt(2, 5);
      // Pick 2-4 random categories to rate
      const cats = pickRandom(
        CATEGORIES,
        randomInt(2, 4)
      );
      const categoryRatings = cats.map((c) => ({
        category: c,
        score: randomInt(2, 5),
      }));

      await Rating.findOneAndUpdate(
        {
          userId: user._id,
          filmId: film._id,
        },
        { score, categoryRatings },
        { upsert: true, new: true }
      );
      ratingCount++;
    }

    // Recalculate film average
    await Rating.recalcFilmAverage(film._id);
  }
  console.log(
    `Generated ${ratingCount} ratings`
  );

  // Print summary
  const updatedFilms = await Film.find({
    tmdbId: {
      $in: films.map((f) => f.tmdbId),
    },
  })
    .select("title avgRating ratingCount")
    .lean();

  console.log("\n--- Film Averages ---");
  for (const f of updatedFilms) {
    console.log(
      `  ${f.title}: ${f.avgRating}/5 (${f.ratingCount} ratings)`
    );
  }

  await disconnectFromDatabase();
  console.log("\nDone! Disconnected.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
