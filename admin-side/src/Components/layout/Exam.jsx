import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const Exam = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionData, setQuestionData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctOption: "",
  });
  const [loading, setLoading] = useState(false); // Loading state

  const fetchExamTopics = () => {
    axios
      .get("https://safetyiqnativebackend.onrender.com/admin/fetchRead")
      .then((result) => {
        setTopics(result.data);
      })
      .catch((error) => {
        console.error("Error fetching topics:", error);
      });
  };

  useEffect(() => {
    fetchExamTopics();
  }, []);

  const handleChange = (e) => {
    setQuestionData({
      ...questionData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...questionData,
      course_name: selectedTopic,
    };

    setLoading(true);

    axios
      .post("https://safetyiqnativebackend.onrender.com/admin/examQuestion", payload, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        console.log("Success:", response.data);
        if (response.data) {
    setLoading(false);
          setQuestionData({
            question: "",
            option1: "",
            option2: "",
            option3: "",
            option4: "",
            correctOption: "",
          });
          toast.success("Question saved successfully!");
          setIsModalOpen(false); // Close modal after submission
        } else {
          toast.error("Questions not saved!");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to save the question.");
      })
      .finally(() => {
        setLoading(false); // Set loading to false after submission
      });
  };

  const openModal = (topic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQuestionData({
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctOption: "",
    });
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Exam Topics</h1>
      <div className="grid grid-cols-3 gap-4">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="bg-blue-500 text-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-blue-600"
            onClick={() => openModal(topic.name)}
          >
            {topic.name}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
              Add Question for {selectedTopic}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="question"
                  className="block text-sm font-medium text-gray-700"
                >
                  Question:
                </label>
                <textarea
                  name="question"
                  value={questionData.question}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="option1"
                  className="block text-sm font-medium text-gray-700"
                >
                  Option 1:
                </label>
                <input
                  type="text"
                  name="option1"
                  value={questionData.option1}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="option2"
                  className="block text-sm font-medium text-gray-700"
                >
                  Option 2:
                </label>
                <input
                  type="text"
                  name="option2"
                  value={questionData.option2}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="option3"
                  className="block text-sm font-medium text-gray-700"
                >
                  Option 3:
                </label>
                <input
                  type="text"
                  name="option3"
                  value={questionData.option3}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="option4"
                  className="block text-sm font-medium text-gray-700"
                >
                  Option 4:
                </label>
                <input
                  type="text"
                  name="option4"
                  value={questionData.option4}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="correctOption"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correct Option (1, 2, 3, or 4):
                </label>
                <input
                  type="number"
                  name="correctOption"
                  value={questionData.correctOption}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min="1"
                  max="4"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
                disabled={loading} // Disable button while loading
              >
                {loading ? "Submitting..." : "Submit Question"}{" "}
                {/* Show submitting text */}
              </button>
            </form>

            <button
              onClick={closeModal}
              className="mt-4 text-red-500 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;
