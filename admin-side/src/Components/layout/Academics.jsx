import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function Academics() {
  const adminId = JSON.parse(localStorage.getItem("token"));
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [admin_id, setId] = useState(adminId);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    admin_id: admin_id,
  });
  const [newCourse, setNewCourse] = useState("");
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    setFilteredItems(
      items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, items]);

  const fetchCourses = () => {
    axios
      .get("http://localhost:8000/admin/courseFetch")
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  };

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

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const toggleCourseModal = () => {
    setShowCourseModal(!showCourseModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewResource((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (e) => {
    setNewCourse(e.target.value);
  };

  const handleResourceSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`http://localhost:8000/admin/upload`, newResource)
      .then((response) => {
        if (response.data.message === "Resource uploaded successfully") {
          setNewResource({ title: "", description: "", admin_id: admin_id });
          setShowModal(false);
          toast.success("Resource uploaded successfully");
          fetchCourses();
        }
      })
      .catch((error) => {
        console.error("Error uploading resource:", error);
      });
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`http://localhost:8000/admin/courses`, {
        name: newCourse,
        admin_id,
      })
      .then((response) => {
        if (response.data.message === "Course added successfully") {
          setNewCourse("");
          toast.success("Course added successfully");
          setShowCourseModal(false);
          fetchCourses();
        }
      })
      .catch((error) => {
        console.error("Error adding course:", error);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-3 py-2 border border-gray-300 rounded-md w-full"
        />
        <button
          onClick={toggleCourseModal}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Add Course
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="flex border-b justify-between">
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Course</th>
              <th className="py-2 px-4">Resource</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className="flex justify-between border-b py-5">
                <td className="py-2 px-4">{item.id}</td>
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4">
                  <button className="shadow-lg w-64 p-2" onClick={toggleModal}>
                    Upload
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-5 sm:px-6">
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
              <button
                onClick={handleClickNext}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                disabled={
                  currentPage >= Math.ceil(filteredItems.length / itemsPerPage)
                }
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w96 shadow-lg">
            <form onSubmit={handleResourceSubmit}>
              <h2 className="text-xl font-bold mb-4">Upload Resource</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={newResource.title}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newResource.description}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="mr-4 px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Upload Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <form onSubmit={handleCourseSubmit}>
              <h2 className="text-xl font-bold mb-4">Add Course</h2>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  name="course"
                  value={newCourse}
                  onChange={handleCourseChange}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="mr-4 px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
