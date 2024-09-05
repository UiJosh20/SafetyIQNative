import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const Resources = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readResources, setReadResources] = useState([]);
  const [firstAidResources, setFirstAidResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      fetchResources();
      setIsLoading(false);
    }, 2000);
  }, []);

  const fetchResources = () => {
    axios
      .get(`http://localhost:8000/admin/fetchResources`)
      .then((response) => {
        const resources = response.data;
        console.log(resources);
        setReadResources(resources.filter((res) => res.read_title));
        setFirstAidResources(resources.filter((res) => res.title));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching resources:", error);
        toast.error("No resources added yet");
        setIsLoading(false);
      });
  };

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
  };

  const handleDeleteSubmit = (title, type) => {
    setTitle(title);
    setResourceType(type);
    toggleDeleteModal();
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:8000/admin/resources/${title}`)
      .then((response) => {
        if (response.data.message === "Resource(s) deleted successfully") {
          fetchResources();
          toast.success("Resource deleted successfully");
          setTitle("");
          toggleDeleteModal();
        }
      })
      .catch((error) => {
        console.error("Error deleting resource:", error);
        toast.error("Error deleting resource.");
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
      <ToastContainer />
      <h3 className="font-bold text-3xl py-4">Read Resources</h3>
      <section className="bg-white w-full flex flex-wrap justify-center p-20 gap-10">
        {readResources.length > 0 ? (
          readResources.map((item, i) => (
            <div key={i} className="w-96 shadow-md border border-gray-500">
              <img src={item.read_image} alt="" />
              <div className="p-3">
                <h1>{item.read_title}</h1>
                <p>{item.read_description}</p>
                <p>{item.read_duration}</p>
              </div>
              <div className="my-3 p-3">
                <button
                  className="shadow-lg w-36 p-2 font-bold bg-red-700 text-white rounded-md"
                  onClick={() => handleDeleteSubmit(item.read_title, "read")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center w-full">No read resources added yet</p>
        )}
      </section>

      <h3 className="font-bold text-3xl py-4">First Aid Resources</h3>
      <section className="bg-white w-full flex flex-wrap justify-center p-20 gap-10">
        {firstAidResources.length > 0 ? (
          firstAidResources.map((item, i) => (
            <div key={i} className="w-96 shadow-md border border-gray-500">
              <img src={item.image} alt="" />
              <div className="p-3">
                <h1>{item.title}</h1>
                <p>{item.description}</p>
                <p>{item.duration}</p>
              </div>
              <div className="my-3 p-3">
                <button
                  className="shadow-lg w-36 p-2 font-bold bg-red-700 text-white rounded-md"
                  onClick={() => handleDeleteSubmit(item.title, "firstAid")}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center w-full">No first aid resources added yet</p>
        )}
      </section>

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
                      Are you sure you want to delete this resource?
                    </p>
                    <button
                      onClick={handleDelete}
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
};

export default Resources;
