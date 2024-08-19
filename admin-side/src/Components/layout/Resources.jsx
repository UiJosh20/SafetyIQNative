import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';

const Resources = () => {
  const adminId = JSON.parse(localStorage.getItem("token"));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readResources, setReadResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readResourcesID, setReadResourcesID] = useState(true);


    useEffect(() => {
      setIsLoading(true)
      setTimeout(()=>{
        fetchResources();
        setIsLoading(false)
      }, 2000)
    }, [])
    

     const fetchResources = () => {
       axios
         .get(`http://localhost:8000/admin/fetchResources`, {
           params: { adminId: adminId },
         })
         .then((response) => {
           setReadResources(response.data);
           
           setIsLoading(false)
           
         })
         .catch((error) => {
           console.error("Error fetching resources:", error);
         });
     };

       const toggleDeleteModal = () => {
         setShowDeleteModal(!showDeleteModal);
       };

      const handleDeleteSubmit = (recoursesId) => {
        setReadResourcesID(recoursesId);
        toggleDeleteModal();
      };

     const handleDelete = () => {
       axios.delete(`http://localhost:8000/admin/resources/${readResourcesID}`)
       .then((response)=>{
           if (response.data.message === "Resource deleted successfully") {
             fetchResources();
             toast.success("Resources deleted successfully");
             setReadResourcesID("");
             toggleDeleteModal();
           }
       })
      
     }

       if (isLoading) {
         return (
           <div className="flex justify-center items-center h-screen">
             <div className="loader"></div>
           </div>
         );
       }

  return (
    <>
      <section className="bg-white w-full flex justify-center p-20 gap-10">
        <ToastContainer />
        {readResources.map((item, i) => (
          <div key={i} className="w-96 shadow-md">
            <img src={item.read_image} alt="" />

            <div className="p-3">
              <h1>{item.read_title}</h1>
              <p>{item.read_description}</p>
              <p>{item.read_duration}</p>
            </div>

            <div className="my-3 p-3">
              <button
                className="shadow-lg w-36 p-2 font-bold bg-red-700 text-white rounded-md"
                onClick={() => handleDeleteSubmit(item.read_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
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
                      Are you sure you want to delete this course?
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
}

export default Resources
