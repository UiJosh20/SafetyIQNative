import React from 'react'

const Login = () => {
  return (
    <>
      <section className="bg-gray-200 h-screen w-screen flex flex-col justify-center items-center">
        <form className="card bg-white shadow-lg bg-base-100 rounded-lg p-14 border border-solid w96">
          <input
            type="text"
            placeholder="Email"
            className="outline-none ms-10 w-96 my-5"
          />
          <input
            type="password"
            placeholder="Password"
            className=" outline-none w-96 ms-10 my-10"
          />

          <button className="btn bg-red-500 mb-3 mt-5 p-3 rounded-md text-white font-bold w-full">
            Login
          </button>
          <a href="#" className='text-gray-500 text-sm text-center  my-10'>Don't have an account? Sign up Forgot password?</a>
          <p className="text-center my-6">OR</p>
    <div className='w-full flex justify-center'>
          <button className="btn bg-gray-800 mt-5 p-3 rounded-md text-white font-bold w-72">
            Create Account
          </button>
    </div>
        </form>
      </section>
    </>
  );
}


export default Login
