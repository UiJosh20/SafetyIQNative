import axios from 'axios';
import React, { useEffect, useState } from 'react'

const Resources = () => {
  const adminId = JSON.parse(localStorage.getItem("token"));
  const [readResources, setReadResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {

         fetchResources();
    }, [])
    

     const fetchResources = () => {
       axios
         .get(`http://localhost:8000/admin/fetchResources`, {
           params: { adminId: adminId },
         })
         .then((response) => {
           setReadResources(response.data);
           console.log(response.data);
           setIsLoading(false)
           
         })
         .catch((error) => {
           console.error("Error fetching resources:", error);
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
      <section className="bg-white w-full flex justify-center p-20 gap-10">
        {readResources.map((item, i) => (
          <div key={i} className="w-96 shadow-md">
            <img src={item.read_image} alt="" />

            <div className="p-3">
              <h1>{item.read_title}</h1>
              <p>{item.read_description}</p>
              <p>{item.read_duration}</p>
            </div>

            <div className="my-3 p-3">
              <button className="bg-red-700 text-white font-bold p-3 rounded-md">
                delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

export default Resources
