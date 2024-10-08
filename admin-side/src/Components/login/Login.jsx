import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  let names = []
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("https://safetyiqnativebackend.onrender.com/admin/login", {
        adminId,
        password,
      })
      .then((response) => {
        setLoading(false);
        if (response.data) {
          let first_name = response.data.admin.first_name;
          let last_name = response.data.admin.last_name;
          let adminObj = {first_name, last_name}
          names.push(adminObj)
          

          localStorage.setItem("adminInfo", JSON.stringify(names))
          localStorage.setItem("id", JSON.stringify(response.data.admin.admin_id));
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
            type="text"
            placeholder="Admin ID"
            className=" w-full my-5 border-2 border-gray-300 outline-red-700 p-5"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            className=" w-full my-5 border-2 border-gray-300 outline-red-700 p-5"
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
