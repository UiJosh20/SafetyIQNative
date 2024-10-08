import axios from "axios";
import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const Dashboard = () => {
  const id = JSON.parse(localStorage.getItem("id"));
  const adminNames = JSON.parse(localStorage.getItem("adminInfo"))
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true); 
    const [totalStudents, setTotalStudents] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState([]);
    const itemsPerPage = 3;
  
  
const fetchTotalStudents = () => {
    axios
      .get(`https://safetyiqnativebackend.onrender.com/admin/students`)
      .then((response) => {
        setTotalStudents(response.data.totalStudents);
        setData(response.data.students);
        
        if (response.data.length > 0) {
          const userEmail = response.data.map(
            (student) => student.email
          );
          localStorage.setItem("userEmail", JSON.stringify(userEmail));
        }
      })
      .catch((error) => {
        console.error("Error fetching total students:", error);
      });
  };



  useEffect(() => {
    // fetchAdminInfo();
    fetchTotalStudents();
    setLoading(false)
  }, [id]);

  useEffect(() => {
    setFilteredItems(
      data.filter(
        (item) =>
          item.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClickPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleClickNext = () => {
    if (currentPage < Math.ceil(filteredItems.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // const fetchAdminInfo = () => {
  //   axios
  //     .get(`https://safetyiqnativebackend.onrender.com/admin/info/${id}`)
  //     .then((response) => {
  //       setAdminInfo(response.data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching admin info:", error);
  //       setLoading(false);
  //     });
  // };

  // const fetchTotalStudents = () => {
  //   axios
  //     .get(`https://safetyiqnativebackend.onrender.com/admin/${id}/students`)
  //     .then((response) => {
  //       setTotalStudents(response.data.totalStudents);
  //       setData(response.data.students);
  //       if (response.data.students.length > 0) {
  //         const userIds = response.data.students.map(
  //           (student) => student.user_id
  //         );
  //         localStorage.setItem("userIds", JSON.stringify(userIds));
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching total students:", error);
  //     });
  // };

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
          <h4 className="big text-gray-700">
            {adminNames[0].first_name} {adminNames[0].last_name}
          </h4>
          <p>Admin ID: {id}</p>
        </div>
      </section>

      <section className="px-10 py-10">
        <small className="font-bold text-gray-500 py-2 w-96 flex">
          Academics
        </small>
        <div className="p-5 bg-gray-100 rounded-lg shadow-lg w-80 mt-5 summary">
          <h2 className="big2 text-gray-700">Number of Students</h2>
          <p>{totalStudents}</p>
        </div>

        <div className="container my-10 mx-auto p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-3 py-2 border-2 border-gray-300 rounded-md w-96 focus:outline-none focus:border-red-900"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="flex gap-96">
                  <th className="py-2 px-4">Student ({totalStudents})</th>
                  <th className="py-2 px-4">Course</th>
                  <th className="py-2 px-4">Total | Grade</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item._id} className="flex gap-96">
                    <td className="py-2 px-4">
                      {item.firstName} {item.lastName}{" "}
                      
                    </td>
                    <td>{item.courseName == null ? "N/A" : item.courseName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between bg-white px-4 pt-10 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredItems.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredItems.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  aria-label="Pagination"
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                >
                  <button
                    onClick={handleClickPrevious}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
                  </button>
                  {/* Pagination buttons */}
                  {Array.from(
                    { length: Math.ceil(filteredItems.length / itemsPerPage) },
                    (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === index + 1
                            ? "bg-black text-white"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  )}
                  <button
                    onClick={handleClickNext}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    disabled={
                      currentPage ===
                      Math.ceil(filteredItems.length / itemsPerPage)
                    }
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
