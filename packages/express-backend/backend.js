import express from "express";
import cors from "cors";
import userService from "./services/user-service.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { registerUser, authenticateUser, loginUser } from "./auth.js";

dotenv.config();

const { MONGO_CONNECTION_STRING } = process.env;

mongoose.set("debug", true);
mongoose
  .connect(MONGO_CONNECTION_STRING + "users") // connect to Db "users"
  .catch((error) => console.log(error));

const app = express();
const port = 8000;

const creds = [];

app.use(cors());
app.use(express.json());

app.get("/", authenticateUser, (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(
    `Example app listening at http://localhost:${port}`
  );
});

app.get("/users", (req, res) => {
  const name = req.query.name;
  const job = req.query.job;

  userService.getUsers(name, job)
    .then((result) => {
      res.send({ users_list: result });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/users/:id", (req, res) => {
  const id = req.params["id"];
  
  userService.findUserById(id)
    .then((result) => {
      if (result === null) {
        res.status(404).send("Resource not found.");
      } else {
        res.send(result);
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

app.post("/users", authenticateUser, (req, res) => {
  const userToAdd = req.body;
  userService.addUser(userToAdd).then((result) =>
    res.status(201).send(result)
  );
});

app.delete("/users/:id", (req, res) => {
  const id = req.params.id;
  
  userService.deleteUserById(id)
    .then((deletedUser) => {
      if (!deletedUser) {
        res.status(404).send("Resource not found.");
      } else {
        res.status(204).send();
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});


// Authentication
app.post("/signup", registerUser);

app.post("/login", loginUser);