import React, { useState, useEffect } from "react";
import Table from "./Table";
import Form from "./Form";
import Login from "./login";
import { Routes, Route, useNavigate } from "react-router-dom";

const API_PREFIX = "http://localhost:8000";

function App() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const INVALID_TOKEN = "INVALID_TOKEN";
  const [token, setToken] = useState(INVALID_TOKEN);
  const [message, setMessage] = useState("");

  function addAuthHeader(otherHeaders = {}) {
    if (token === INVALID_TOKEN) {
      return otherHeaders;
    } else {
      return {
        ...otherHeaders,
        Authorization: `Bearer ${token}`
      };
    }
  }

  function fetchUsers() {
    const promise = fetch(`${API_PREFIX}/users`, {
      headers: addAuthHeader()
    });

  return promise;
  }
  
  useEffect(() => {
    if (token !== INVALID_TOKEN) {
      fetchUsers()
        .then((res) => res.status === 200 ? res.json() : undefined)
        .then((json) => {
          if (json) setCharacters(json["users_list"]);
          else setCharacters(null);
        })
        .catch((error) => console.log(error));
    }
  }, [token]);

  function postUser(person) {
    const promise = fetch(`${API_PREFIX}/users`, {
      method: "POST",
      headers: addAuthHeader({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(person)
    });

    return promise;
  }

  function updateList(person) {
    postUser(person)
      .then((res) => {
        if (res.status != 201) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((newUser) => {
        setCharacters([...characters, newUser]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function deleteUser(index) {
    const person = characters[index];
    const promise = fetch(`${API_PREFIX}/users/${person._id}`, {
      method: "DELETE",
      headers: addAuthHeader({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(person),
    });

    return promise;
  }

  function removeOneCharacter(index) {
    deleteUser(index)
      .then((res) => {
        if (res.status != 204) {
          throw new Error(res.statusText);
        }
        const updated = characters.filter((character, i) => {
          return i !== index;
        });
        setCharacters(updated);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function loginUser(creds) {
  const promise = fetch(`${API_PREFIX}/login`, {
    method: "POST",
    headers: addAuthHeader({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(creds)
  })
    .then((response) => {
      if (response.status === 200) {
        response
          .json().then((payload) => {setToken(payload.token); navigate("/");});
        setMessage(`Login successful; auth token saved`);
      } else {
        setMessage(
          `Login Error ${response.status}: ${response.data}`
        );
      }
    })
    .catch((error) => {
      setMessage(`Login Error: ${error}`);
    });

  return promise;
}

function signupUser(creds) {
  const promise = fetch(`${API_PREFIX}/signup`, {
    method: "POST",
    headers: addAuthHeader({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(creds)
  })
    .then((response) => {
      if (response.status === 201) {
        response
          .json()
          .then((payload) => {setToken(payload.token); navigate("/");});
        setMessage(
          `Signup successful for user: ${creds.username}; auth token saved`
        );
      } else {
        setMessage(
          `Signup Error ${response.status}: ${response.data}`
        );
      }
    })
    .catch((error) => {
      setMessage(`Signup Error: ${error}`);
    });

  return promise;
}

  return (
    <div className="container">
      <nav>
        <a href="/">Home</a> | <a href="/login">Login</a> | <a href="/signup">Sign Up</a>
      </nav>
      <Routes>
        <Route path="/login" element={<Login handleSubmit={loginUser} />} />
        <Route path="/" element={
          <>
            <Table characterData={characters} removeCharacter={removeOneCharacter} />
            <Form handleSubmit={updateList} />
          </>
        }/>
        <Route
          path="/signup"
          element={
            <Login handleSubmit={signupUser} buttonLabel="Sign Up" />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
