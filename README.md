Our application is called Showme, and it is a media (movies & TV) rating app. We developed it to be like a social network, where users can see others' watchlists, their ratings, and explore thousands of media. A user will be able to add another user and explore their ratings and recommend new media based on what users prefer in common with another. There will also be lots of trending movies, and recommendations based on what you rate & watch. There is also organization by top ratings by categories and simple sorting methods.

UI Prototype last updated approximately 3 weeks ago:
https://www.figma.com/board/hdZK3xvzd8q0w9ZeBUTSau/UML-DIagram?node-id=5-1103&t=8jWiTwnBWy0UW6NY-1

How to set up on own machine:
TIP FOR MAC USERS:
  switch line 19 "dev:..." to: 
    "dev": "concurrently "npm run dev --workspace=packages/backend" "npm run dev --workspace=packages/frontend"",
  this is because of commands that MacOS's terminal cannot support; primarily "start"

Other than this issue, all that needs to be setup are database, API keys, and secret phrases.
  1. Create .env file that is native to the backend folder (not inside any folders that are already inside the backend folder)
  2. Should there not already be a .gitignore file inside the root folder, or should .env not be an included extension, create/add such things respectfully.
  3. Follow .env.example file to what keys should be copied into the .env file that is in the backend folder.
  4. Where you gather those keys will vary
    1. TMDB API is free (no need to buy a premium tier for most media) through https://developer.themoviedb.org/docs/getting-started
    2. We used a MongoDB database. No need to have a shared database among teams, but need to have a current project through which a network is setup (remember to use password of the project/network, NOT OF YOUR OWN ACCOUNT)
    3. Port numbers at the ending of CORS & CLIENT origin will depend on what port your Vite & React app is running through. Since most of our team's machines used port 5173, we had "http://localhost:5173"
    4. Any others will be left the same.