import React, { useState } from "react";

function Login(props) {
  const [creds, setCreds] = useState({
    username: "",
    pwd: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    switch (name) {
      case "username":
        setCreds({ ...creds, username: value });
        break;
      case "password":
        setCreds({ ...creds, pwd: value });
        break;
    }
  }

  function submitForm() {
    props.handleSubmit(creds);
    setCreds({ username: "", pwd: "" });
  }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950">
            <form
                className="w-80 rounded-2xl bg-gray-900 p-8 shadow-lg border border-gray-800"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-white">
                    {props.modalLabel || "Log In"}
                </h2>

                <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={creds.username}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    className="w-full mb-6 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={creds.pwd}
                    onChange={handleChange}
                    required
                />

                <button
                    className="w-full py-2 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-300 transition"
                    type="button"
                    value={props.buttonLabel || "Log In"}
                    onClick={submitForm}
                > {props.buttonLabel || "Log In"}
                </button>
            </form>
        </div>
    );
}

export default Login;