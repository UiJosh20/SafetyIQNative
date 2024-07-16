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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    course_id: "",
    time_taken: "",
    image: null,
    admin_id: adminId,
    note: "", // Add note to the state
  });
  const [newCourse, setNewCourse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
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
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setIsLoading(false);
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

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setNewResource((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleCourseChange = (e) => {
    setNewCourse(e.target.value);
  };

  const handleResourceSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", newResource.title);
    formData.append("description", newResource.description);
    formData.append("course_id", newResource.course_id);
    formData.append("time_taken", newResource.time_taken);
    formData.append("image", newResource.image);
    formData.append("admin_id", newResource.admin_id);
    formData.append("note", newResource.note); // Append note to formData

    axios
      .post("http://localhost:8000/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data.message === "Resource uploaded successfully") {
          setNewResource({
            title: "",
            description: "",
            course_id: "",
            time_taken: "",
            image: null,
            admin_id: adminId,
            note: "", // Reset note
          });
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
      .post("http://localhost:8000/admin/courses", {
        name: newCourse,
        admin_id: adminId,
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

  const handleDeleteSubmit = (courseId) => {
    setCourseId(courseId);
    toggleDeleteModal();
  };

  const handleDeleteCourse = () => {
    axios
      .delete(`http://localhost:8000/admin/courseDelete/${courseId}`)
      .then((response) => {
        if (response.data.message === "Course deleted successfully") {
          toast.success("Course deleted successfully");
          fetchCourses();
          setCourseId("");
          toggleDeleteModal();
        }
      })
      .catch((error) => {
        console.error("Error deleting course:", error);
        toast.error("Error deleting course");
      });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
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
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr className="flex border-b justify-between">
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">Course</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="flex justify-between border-b py-5"
                  >
                    <td className="py-2 px-4">{item.id}</td>
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        className="shadow-lg w-36 bg-gray-400 p-2 rounded-md font-bold"
                        onClick={() =>
                          setNewResource(
                            (prev) => ({ ...prev, course_id: item.id }),
                            toggleModal()
                          )
                        }
                      >
                        Upload
                      </button>
                      <button
                        className="shadow-lg w-36 p-2 font-bold bg-red-700 text-white rounded-md"
                        onClick={() => handleDeleteSubmit(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-5 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={handleClickPrevious}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={handleClickNext}
              disabled={
                currentPage === Math.ceil(filteredItems.length / itemsPerPage)
              }
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} results
                </span>
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={handleClickPrevious}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                >
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={handleClickNext}
                  disabled={
                    currentPage === Math.ceil(filteredItems.length / itemsPerPage)
                  }
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                >
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          id="uploadModal"
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="modal-overlay absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="modal-container bg-white w96 mx-auto rounded shadow-lg z-50 overflow-y-auto">
            <div className="modal-content py-4 text-left px-6">
              <div className="flex justify-between items-center pb-3">
                <p className="text-2xl font-bold">Upload Resource</p>
                <button
                  className="modal-close cursor-pointer z-50"
                  onClick={toggleModal}
                >
                  <svg
                    className="fill-current text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                  >
                    <path d="M14.53 3.47a.75.75 0 00-1.06-1.06L9 6.94 4.53 2.47a.75.75 0 00-1.06 1.06L6.94 9l-3.47 3.53a.75.75 0 001.06 1.06L9 11.06l3.53 3.47a.75.75 0 001.06-1.06L11.06 9l3.47-3.53z"></path>
                  </svg>
                </button>
              </div>
              <form onSubmit={handleResourceSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newResource.title}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
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
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Time Taken
                  </label>
                  <input
                    type="text"
                    name="time_taken"
                    value={newResource.time_taken}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Note
                  </label>
                  <textarea
                    name="note"
                    value={newResource.note}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div
          id="addCourseModal"
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="modal-overlay absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="modal-container bg-white w-96 mx-auto rounded shadow-lg z-50 overflow-y-auto">
            <div className="modal-content py-4 text-left px-6">
              <div className="flex justify-between items-center pb-3">
                <p className="text-2xl font-bold">Add Course</p>
                <button
                  className="modal-close cursor-pointer z-50"
                  onClick={toggleCourseModal}
                >
                  <svg
                    className="fill-current text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                  >
                    <path d="M14.53 3.47a.75.75 0 00-1.06-1.06L9 6.94 4.53 2.47a.75.75 0 00-1.06 1.06L6.94 9l-3.47 3.53a.75.75 0 001.06 1.06L9 11.06l3.53 3.47a.75.75 0 001.06-1.06L11.06 9l3.47-3.53z"></path>
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCourseSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={newCourse}
                    onChange={handleCourseChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                  >
                    Add Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          id="deleteModal"
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="modal-overlay absolute inset-0 bg-gray-900 opacity-50"></div>
          <div className="modal-container bg-white w-96 mx-auto rounded shadow-lg z-50 overflow-y-auto">
            <div className="modal-content py-4 text-left px-6">
              <div className="flex justify-between items-center pb-3">
                <p className="text-2xl font-bold">Delete Course</p>
                <button
                  className="modal-close cursor-pointer z-50"
                  onClick={toggleDeleteModal}
                >
                  <svg
                    className="fill-current text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                  >
                    <path d="M14.53 3.47a.75.75 0 00-1.06-1.06L9 6.94 4.53 2.47a.75.75 0 00-1.06 1.06L6.94 9l-3.47 3.53a.75.75 0 001.06 1.06L9 11.06l3.53 3.47a.75.75 0 001.06-1.06L11.06 9l3.47-3.53z"></path>
                  </svg>
                </button>
              </div>
              <p>Are you sure you want to delete this course?</p>
              <div className="flex items-center justify-between pt-3">
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={toggleDeleteModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


