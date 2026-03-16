# UML Class Diagram

Last updated: 2026-03-16

This diagram documents the backend domain model as implemented in `packages/backend/src/models/*`.

- Diagram source (checked in): `docs/uml/class-diagram.mmd`
- Reference (team board): the existing Figma board linked from the root `README.md`

```mermaid
classDiagram
  class User {
    +string username
    +string passwordHash
    +string bio
    +string[] favoriteGenres
    +string profilePictureUrl
    +number[] favoriteMovies
  }

  class Film {
    +number tmdbId
    +string type
    +string title
    +string description
    +number releaseYear
    +string director
    +string[] cast
    +string posterURL
    +number avgRating
    +number ratingCount
  }

  class Genre {
    +string name
    +number tmdbId
  }

  class Rating {
    +ObjectId userId
    +ObjectId filmId
    +number score
    +string reviewText
    +CategoryRating[] categoryRatings
    +Date createdAt
    +Date updatedAt
  }

  class CategoryRating {
    +string category
    +number score
  }

  User "1" <-- "0..*" Rating : userId
  Film "1" <-- "0..*" Rating : filmId
  Film "0..*" o-- "0..*" Genre : genreIds
  Rating "1" o-- "0..*" CategoryRating : categoryRatings
```

Notes

- `Rating.categoryRatings` is modeled as a Mongoose subdocument array (not a top-level collection).
- `Film.genreIds` is an array of `Genre` references, representing a many-to-many relationship.

