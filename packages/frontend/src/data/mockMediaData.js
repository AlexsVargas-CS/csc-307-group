// Mock data for the Media Detail page.
// Shapes mirror TMDB API responses so the swap to real data is minimal.

export const mockFilm = {
  tmdbId: 550,
  mediaType: "movie",
  title: "Fight Club",
  year: 1999,
  overview:
    "A ticking-Loss of control in an oppressive everyday life causes an office worker and a soap maker to form an underground fight club that evolves into an anarchist organization threatening to disrupt modern civilization.",
  director: "David Fincher",
  cast: [
    "Brad Pitt",
    "Edward Norton",
    "Helena Bonham Carter",
    "Meat Loaf",
    "Jared Leto",
  ],
  genres: ["Drama", "Thriller", "Comedy"],
  posterUrl:
    "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  backdropUrl:
    "https://image.tmdb.org/t/p/original/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg",
};

export const mockAggregateRatings = {
  acting: { average: 8.2, count: 47 },
  cinematography: { average: 9.1, count: 42 },
  soundtrack: { average: 7.5, count: 38 },
  soundDesign: { average: 6.8, count: 35 },
  artDirection: { average: 8.7, count: 40 },
  writing: { average: 7.9, count: 45 },
};

export const mockReviews = [
  {
    id: "r1",
    userId: "u1",
    username: "cinephile_jane",
    avatarUrl: null,
    overallStarRating: 4.5,
    content:
      "Absolutely stunning cinematography paired with a haunting soundtrack. The director's vision is uncompromising and every frame feels intentional. The third act loses some momentum but the performances carry it through.",
    likeCount: 23,
    isLikedByCurrentUser: false,
    createdAt: "2025-12-15T10:30:00Z",
  },
  {
    id: "r2",
    userId: "u2",
    username: "movie_buff_42",
    avatarUrl: null,
    overallStarRating: 3.0,
    content:
      "Decent but overhyped. The writing felt formulaic despite the beautiful art direction. Sound design was the real MVP here.",
    likeCount: 8,
    isLikedByCurrentUser: true,
    createdAt: "2025-12-20T14:15:00Z",
  },
  {
    id: "r3",
    userId: "u3",
    username: "filmfanatic99",
    avatarUrl: null,
    overallStarRating: 5.0,
    content:
      "A masterpiece. Every single element — acting, writing, cinematography — fires on all cylinders. This is the kind of film that reminds you why cinema exists. I've watched it four times and I notice something new each viewing.",
    likeCount: 41,
    isLikedByCurrentUser: false,
    createdAt: "2025-11-03T08:00:00Z",
  },
  {
    id: "r4",
    userId: "u4",
    username: "casual_viewer",
    avatarUrl: null,
    overallStarRating: 3.5,
    content:
      "Enjoyed it overall but felt a bit long. Great performances though.",
    likeCount: 5,
    isLikedByCurrentUser: false,
    createdAt: "2026-01-10T19:45:00Z",
  },
  {
    id: "r5",
    userId: "u5",
    username: "directors_cut",
    avatarUrl: null,
    overallStarRating: 4.0,
    content:
      "The art direction alone makes this worth watching. Fincher's meticulous attention to color grading and set design creates an atmosphere that's both grimy and beautiful. The soundtrack complements the visuals perfectly, though I wish the writing had taken a few more risks in the second half.",
    likeCount: 17,
    isLikedByCurrentUser: false,
    createdAt: "2026-02-05T12:20:00Z",
  },
];

export const mockSimilarFilms = [
  {
    id: "s1",
    tmdbId: 680,
    title: "Pulp Fiction",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    mediaType: "movie",
  },
  {
    id: "s2",
    tmdbId: 807,
    title: "Se7en",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8DP3dnS4w4Kf.jpg",
    mediaType: "movie",
  },
  {
    id: "s3",
    tmdbId: 37799,
    title: "The Social Network",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
    mediaType: "movie",
  },
  {
    id: "s4",
    tmdbId: 137523,
    title: "Gone Girl",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/qymaW7g9Wfl4fgOBksmblAEMzAS.jpg",
    mediaType: "movie",
  },
  {
    id: "s5",
    tmdbId: 14,
    title: "American Beauty",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/wby9315QzVKdW9BonAefg8jGTTb.jpg",
    mediaType: "movie",
  },
  {
    id: "s6",
    tmdbId: 641,
    title: "Requiem for a Dream",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/nOhQBJCAMWBEhEvFOhDEgt2DSOV.jpg",
    mediaType: "movie",
  },
];

export const DIMENSION_LABELS = {
  acting: "Acting",
  cinematography: "Cinematography",
  soundtrack: "Soundtrack",
  soundDesign: "Sound Design",
  artDirection: "Art Direction",
  writing: "Writing",
};
