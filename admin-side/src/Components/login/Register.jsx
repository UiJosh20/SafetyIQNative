import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required("First Name is required"),
    last_name: Yup.string().required("Last Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const { confirmPassword, ...data } = values; // Exclude confirmPassword before sending data
    axios
      .post("http://localhost:8000/admin/signup", data) // Make sure this URL is correct
      .then((response) => {
        console.log("Admin registered:", response.data);
        setSubmitting(false);
        resetForm();
      })
      .catch((error) => {
        if (error.response && error.response.status === 409) {
          toast.error("Email already used");
        } else {
          console.error("Error registering admin:", error);
        }
        setSubmitting(false);
      });
  };

  return (
    <section className="bg-gray-200 h-screen w-screen flex flex-col justify-center items-center">
      <ToastContainer />
      <Formik
        initialValues={{
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="card bg-white shadow-lg bg-base-100 rounded-lg px-14 border border-solid w96 py-8">
            <div className="flex justify-between mb-4">
              <div className="w-1/2 pr-2">
                <Field
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  className="outline-none w-full bg-white p-3"
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-red-600"
                />
              </div>
              <div className="w-1/2 pl-2">
                <Field
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  className="outline-none w-full bg-white p-3"
                />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className="text-red-600"
                />
              </div>
            </div>
            <div className="mb-4">
              <Field
                type="email"
                name="email"
                placeholder="Email"
                className="outline-none w-full bg-white p-3"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-600"
              />
            </div>
            <div className="mb-4 relative">
              <Field
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="outline-none w-full bg-white p-3"
              />
              <span
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-600"
              />
            </div>
            <div className="mb-4 relative">
              <Field
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                className="outline-none w-full bg-white p-3"
              />
              <span
                onClick={toggleShowConfirmPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </span>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red-600"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn bg-red-900 mb-3 mt-5 p-3 rounded-md text-white font-bold w-full"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
            <p className="text-gray-500 text-sm text-center my-10">
              Do you have an admin account?{" "}
              <Link to="/signup">Login here.</Link>
            </p>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default Register;
