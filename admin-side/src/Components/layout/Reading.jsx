import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function Reading() {
  const adminId = JSON.parse(localStorage.getItem("token"));
  const userId = JSON.parse(localStorage.getItem("userIds"))[0];
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
    note: "",
    user_id: userId,
    admin_id: adminId,
    course_name: "",
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
      .get(`http://localhost:8000/admin/fetchRead/${adminId}/${userId}`)
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
    setNewResource((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleCourseChange = (e) => {
    setNewCourse(e.target.value);
  };

  const handleResourceSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", newResource.title);
    formData.append("description", newResource.description);
    formData.append("time_taken", newResource.time_taken);
    formData.append("image", newResource.image);
    formData.append("note", newResource.note);
    formData.append("course_id", newResource.course_id);
    formData.append("course_name", newResource.course_name);
    formData.append("admin_id", adminId);
    formData.append("user_id", userId);

    axios
      .post("http://localhost:8000/admin/uploadRead", formData, {
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
            course_name: "",
            time_taken: "",
            image: null,
            note: "",
            user_id: userId,
            admin_id: adminId,
          });
          setShowModal(false);
          toast.success("Reading resource uploaded successfully");
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
      .post(`http://localhost:8000/admin/readCourseAdd`, {
        name: newCourse,
        admin_id: adminId,
        user_id: userId,
      })
      .then((response) => {
        if (response.data.message === "Course added successfully") {
          setNewCourse("");
          toast.success("Reading course added successfully");
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
      .delete(`http://localhost:8000/admin/readDelete/${courseId}`)
      .then((response) => {
        if (response.data.message === "Course deleted successfully") {
          toast.success("Reading course deleted successfully");
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
                  <th className="py-2 px-4">Courses to read</th>
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
                            (prev) => ({
                              ...prev,
                              course_id: item.readcourse_id,
                              course_name: item.name,
                            }),
                            toggleModal()
                          )
                        }
                      >
                        Upload
                      </button>
                      <button
                        className="shadow-lg w-36 p-2 font-bold bg-red-700 text-white rounded-md"
                        onClick={() => handleDeleteSubmit(item.readcourse_id)}
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
                <span className="font-medium">{indexOfLastItem}</span> of{" "}
                <span className="font-medium">{filteredItems.length}</span>{" "}
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
      </div>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Upload Resource
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleResourceSubmit}>
                      <input
                        type="text"
                        name="title"
                        value={newResource.title}
                        onChange={handleInputChange}
                        placeholder="Resource Title"
                        className="w-full border border-gray-300 p-2 rounded mt-2"
                        required
                      />
                      <textarea
                        name="description"
                        value={newResource.description}
                        onChange={handleInputChange}
                        placeholder="Resource Description"
                        className="w-full border border-gray-300 p-2 rounded mt-2"
                        required
                      />
                      <input
                        type="text"
                        name="time_taken"
                        value={newResource.time_taken}
                        onChange={handleInputChange}
                        placeholder="Time Taken"
                        className="w-full border border-gray-300 p-2 rounded mt-2"
                        required
                      />
                      <input
                        type="file"
                        name="image"
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-2 rounded mt-2"
                        required
                      />
                      <textarea
                        name="note"
                        value={newResource.note}
                        onChange={handleInputChange}
                        placeholder="Additional Notes"
                        className="w-full border border-gray-300 p-2 rounded mt-2"
                      />

                      <input
                        type="text"
                        id="course_id"
                        name="course_id"
                        value={newResource.course_id}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        disabled
                        hidden
                      />
                      <input
                        type="text"
                        id="course_name"
                        name="course_name"
                        value={newResource.course_name}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        disabled
                        hidden
                      />
                      <button
                        type="submit"
                        className="w-full bg-green-500 text-white p-2 rounded mt-2"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={toggleModal}
                        className="w-full bg-red-500 text-white p-2 rounded mt-2"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add Course
                  </h3>
                  <div className="mt-2">
                    <form onSubmit={handleCourseSubmit}>
                      <input
                        type="text"
                        name="course"
                        value={newCourse}
                        onChange={handleCourseChange}
                        placeholder="Course Name"
                        className="w-full border border-gray-300 p-2 rounded mt-2"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-green-500 text-white p-2 rounded mt-2"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={toggleCourseModal}
                        className="w-full bg-red-500 text-white p-2 rounded mt-2"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirm Delete
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this course?
                    </p>
                    <button
                      onClick={handleDeleteCourse}
                      className="w-full bg-red-500 text-white p-2 rounded mt-2"
                    >
                      Delete
                    </button>
                    <button
                      onClick={toggleDeleteModal}
                      className="w-full bg-gray-500 text-white p-2 rounded mt-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
