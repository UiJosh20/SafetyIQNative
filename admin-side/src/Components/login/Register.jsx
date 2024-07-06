import React from 'react'
import { Link } from 'react-router-dom'

const Register = () => {
  return (
    <>
      <section className="bg-gray-200 h-screen w-screen flex flex-col justify-center items-center">
        <form className="card bg-white shadow-lg bg-base-100 rounded-lg px-14 border border-solid w96">
          <input
            type="text"
            placeholder="First Name"
            className="outline-none ms-10 w-96 my-10"
          />
          <input
            type="text"
            placeholder="Last Name"
            className="outline-none ms-10 w-96 my-10"
          />
          <input
            type="email"
            placeholder="Email"
            className="outline-none ms-10 w-96 my-10"
          />
          <input
            type="password"
            placeholder="Password"
            className="outline-none w-96 ms-10 my-10"
          />

          <button className="btn bg-red-900 mb-3 mt-5 p-3 rounded-md text-white font-bold w-full">
            Create Account
          </button>
          <p className="text-gray-500 text-sm text-center my-10">
            Do you have an admin account? <Link to="/signup">Login here.</Link>
          </p>

         
        </form>
      </section>
    </>
  );
}

export default Register
