import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // eslint-disable-next-line no-alert
      console.error("Login failed", error);
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
    } catch (error) {
      console.error("Sign-up failed", error);
    }
  };

  return (
    <div>
      <div className="border-2 border-black bg-gray-300 rounded-md flex flex-col justify-center w-1/2 items-center mx-auto mt-12 gap-4">
        <div className="mt-4 flex items-center justify-between w-3/5">
          <label>Email:</label>
          <input
            className="border-2 border-black p-2 rounded-md"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between w-3/5">
          <label>Password:</label>
          <input
            className="border-2 border-black p-2 rounded-md"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleLogin}
          className="border-2 border-black mb-4 p-2 rounded-md bg-white hover:bg-gray-100"
        >
          Login
        </button>
      </div>
      <div className="mt-8 border-2 border-black bg-gray-300 rounded-md flex flex-col justify-center w-1/2 items-center mx-auto gap-4">
        <div className="mt-4 flex items-center justify-between w-3/5">
          <label>Email:</label>
          <input
            className="border-2 border-black p-2 rounded-md"
            type="email"
            value={signUpEmail}
            onChange={(e) => setSignUpEmail(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between w-3/5">
          <label>Password:</label>
          <input
            className="border-2 border-black p-2 rounded-md"
            type="password"
            value={signUpPassword}
            onChange={(e) => setSignUpPassword(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleSignUp}
          className="border-2 border-black mb-4 p-2 rounded-md bg-white hover:bg-gray-100"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
