import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <>
      <section className="bg-gray-200 h-screen w-screen flex flex-col justify-center items-center">
        <form className="card bg-white shadow-lg bg-base-100 rounded-lg p-14 border border-solid w96">
          <input
            type="number"
            placeholder="Admin ID"
            className="outline-none ms-10 w-96 my-5"
          />
          <input
            type="password"
            placeholder="Password"
            className="outline-none w-96 ms-10 my-10"
          />

          <button className="btn bg-red-900 mb-3 mt-5 p-3 rounded-md text-white font-bold w-full">
            Login
          </button>
          <p className="text-gray-500 text-sm text-center my-10">
            Don't have an account? <Link to="/signup">Sign up</Link> Forgot
            password?
          </p>
          <p className="text-center my-6">OR</p>
          <div className="w-full flex justify-center">
            <Link
              to="/admin/signup"
              className="btn bg-gray-800 mt-5 p-3 rounded-md text-white text-center font-bold w-72"
            >
              Create Account
            </Link>
          </div>
        </form>
      </section>
    </>
  );
};

export default Login;
