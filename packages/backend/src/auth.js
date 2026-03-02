import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

//const creds = [];

export function registerUser(req, res) {
  const { username, pwd } = req.body;

  if (!username || !pwd) {
    return res.status(400).send("Bad request: Invalid input data.");
  }
  User.findOne({ username }).then((existingUser) => {
    if (existingUser) {
      return res.status(409).send("Username already taken");
    }

    bcrypt
      .genSalt(10)
      .then((salt) => bcrypt.hash(pwd, salt))
      .then((passwordHash) => {
        return User.create({ username, passwordHash });
      })
      .then((user) => {
        return generateAccessToken(user.username);
      })
      .then((token) => {
        res.status(201).send({ token });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Server error");
      });
  });
}

function generateAccessToken(username) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { username: username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
}

export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token received");
    return res.status(401).end();
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (decoded) {
      req.user = decoded;
      next();
    } else {
      console.log("JWT error:", error);
      res.status(401).end();
    }
  });
}


export function loginUser(req, res) {
  const { username, pwd } = req.body;

  User.findOne({ username })
    .then((retrievedUser) => {
      if (!retrievedUser) {
        return res.status(401).send("Unauthorized");
      }

      return bcrypt
        .compare(pwd, retrievedUser.passwordHash)
        .then((matched) => {
          if (!matched) {
            return res.status(401).send("Unauthorized");
          }

          return generateAccessToken(username).then((token) => {
            res.status(200).send({ token });
          });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Server error");
    });
}