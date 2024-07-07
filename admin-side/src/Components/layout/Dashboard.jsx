import axios from "axios";
import React, { useState, useEffect } from "react";

const Dashboard = () => {
  const id = JSON.parse(localStorage.getItem("token"));
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    fetchAdminInfo();
    fetchTotalStudents();
  }, [id]);

     const fetchAdminInfo = () => {
       axios
         .get(`http://localhost:8000/admin/info/${id}`)
         .then((response) => {
           setAdminInfo(response.data);
           setLoading(false);
         })
         .catch((error) => {
           console.error("Error fetching admin info:", error);
           setLoading(false);
         });
     };

     const fetchTotalStudents = () => {
       axios
         .get(`http://localhost:8000/admin/${id}/students`)
         .then((response) => {
           setTotalStudents(response.data.totalStudents);
         })
         .catch((error) => {
           console.error("Error fetching total students:", error);
         });
     };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <section className="px-10 py-10">
        <div className="p-5 bg-red-100 rounded-lg shadow-lg w-80 mt-5 summary">
          <h4 className="big  text-gray-700">
            {adminInfo
              ? `${adminInfo.first_name} ${adminInfo.last_name}`
              : "Admin"}
          </h4>
          <p>Admin ID: {id}</p>
        </div>
      </section>

      <section className="px-10 py-10">
        <small className="font-bold text-gray-500 py-2 w-96 flex">
          Academics
        </small>
        <div className="p-5 bg-gray-100 rounded-lg shadow-lg w-80 mt-5 summary">
          <h2 className="big2  text-gray-700">Number of Students</h2>
          <p>{totalStudents}</p>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
