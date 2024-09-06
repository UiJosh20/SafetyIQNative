// components/Academics.js

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function Academics() {
  const adminId = JSON.parse(localStorage.getItem("id"));
  // const userId = JSON.parse(localStorage.getItem("userIds"))[0];

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
    time_taken: "",
    image: null,
    note: "",
    course_name:""
  });
  const [newCourse, setNewCourse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const fetchCourses = () => {
    axios
      .get(
        `http://localhost:8000/admin/fetchCourse`
      )
      .then((response) => {
        setItems(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
    setFilteredItems(
      items.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, items]);

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
    setNewResource((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleCourseChange = (e) => {
    setNewCourse(e.target.value);
  };

const handleResourceSubmit = (e) => {
  e.preventDefault();

  // Create a new FormData object to hold the form data
  const formData = new FormData();
  formData.append("title", newResource.title);
  formData.append("description", newResource.description);
  formData.append("time_taken", newResource.time_taken);
  formData.append("image", newResource.image);
  formData.append("note", newResource.note);
  formData.append("course_name", newResource.course_name);


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
          note: "",
        });
        setShowModal(false);
        toast.success("Resource uploaded successfully");
        fetchCourses();
      }
    })
    .catch((error) => {
      console.error("Error uploading resource:", error);
      toast.error("Error uploading resource");
    });
};


  const handleCourseSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`http://localhost:8000/admin/course`, {
        name: newCourse,
        admin_id: adminId,
      })
      .then((response) => {
        if (response.data.message === "Course added successfully") {
          let course_id = response.data.id;
          setNewCourse("");
          toast.success("Course added successfully");
          setShowCourseModal(false);
          setCourseId(course_id)
          
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
      .delete(`http://localhost:8000/admin/course/${courseId}`)
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
                  <th className="py-2 px-4">Course</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr
                    key={item.course_id}
                    className="flex justify-between border-b py-5"
                  >
            
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        className="shadow-lg w-36 bg-gray-400 p-2 rounded-md font-bold"
                        onClick={() =>
                          setNewResource(
                            (prev) => ({ ...prev, course_name: item.name }),
                            toggleModal()
                          )
                        }
                      >
                        Upload
                      </button>
                      <button
                        className="shadow-lg w-36 p-2 font-bold bg-red-700 text-white rounded-md"
                        onClick={() => handleDeleteSubmit(item.name)}
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
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={handleClickPrevious}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {Array.from({
                  length: Math.ceil(filteredItems.length / itemsPerPage),
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium ${
                      currentPage === index + 1
                        ? "bg-indigo-50 border-indigo-500 text-indigo-600 z-10"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={handleClickNext}
                  disabled={
                    currentPage ===
                    Math.ceil(filteredItems.length / itemsPerPage)
                  }
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w96">
              <h2 className="text-2xl mb-4">Upload Resource</h2>
              <form
                onSubmit={handleResourceSubmit}
                enctype="multipart/form-data"
              >
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="title"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="Resources title"
                    value={newResource.title}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={newResource.description}
                    placeholder="Topic description"
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="time_taken"
                  >
                    Amout of time
                  </label>
                  <input
                    id="time_taken"
                    name="time_taken"
                    type="text"
                    value={newResource.time_taken}
                    placeholder="Amount of time to read"
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  ></input>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="image"
                  >
                    Topic media
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  ></input>
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="description"
                  >
                    Note
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    rows={4}
                    value={newResource.note}
                    placeholder="@ Resources"
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  ></textarea>
                </div>

                    
                <div className="mb-4" hidden>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="course_id"
                  >
                    Course Name
                  </label>
                  <input
                    type="text"
                    id="course_id"
                    name="course_id"
                    value={newResource.course_name}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    disabled
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="mr-4 bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showCourseModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w96">
              <h2 className="text-2xl mb-4">Add Course</h2>
              <form onSubmit={handleCourseSubmit}>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Course Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newCourse}
                    onChange={handleCourseChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={toggleCourseModal}
                    className="mr-4 bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w96 shadow-lg">
              <h2 className="text-2xl mb-4">Delete Course</h2>
              <p>Are you sure you want to delete this course?</p>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={toggleDeleteModal}
                  className="mr-4 bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCourse}
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
