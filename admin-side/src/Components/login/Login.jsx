import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("http://localhost:8000/admin/login", { adminId, password })
      .then((response) => {
        setLoading(false);
        if (response.data) {
          localStorage.setItem("token", response.data.adminId);
          toast.success("Login successful", {
            onClose: () => navigate("/admin/dashboard"),
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        if (error.response && error.response.status === 401) {
          toast.error("Invalid Admin ID or Password");
        } else {
          console.error("Error logging in:", error);
          toast.error("Internal Server Error");
        }
      });
  };

  return (
    <>
      <section className="bg-gray-200 h-screen w-screen flex flex-col justify-center items-center">
        <ToastContainer />
        <form
          className="card bg-white shadow-lg bg-base-100 rounded-lg p-14 border border-solid w96"
          onSubmit={handleSubmit}
        >
          <input
            type="number"
            placeholder="Admin ID"
            className="outline-none ms-10 w-full my-5"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            className="outline-none w-full ms-10 my-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="btn bg-red-900 mb-3 mt-5 p-3 rounded-md text-white font-bold w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"} 
          </button>
          <p className="text-gray-500 text-sm text-center my-10">
            Don't have an account? <Link to="/signup">Sign up</Link> Forgot
            password?
          </p>
          <p className="text-center my-6">OR</p>
          <div className="w-full flex justify-center">
            <Link
              to="/signup"
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
