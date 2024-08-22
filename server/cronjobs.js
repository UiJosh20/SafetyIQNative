const cron = require("node-cron");
const db = require("./model/user.model"); // Adjust the path as needed

// Schedule a job to run every day at 4 PM
cron.schedule("0 16 * * *", () => {
  // Fetch all users
  db("safetyiq_table")
    .select("user_id")
    .then((users) => {
      const promises = users.map((user) => {
        // Get a new topic and associated resources for each user
        return db("courses_table")
          .orderByRaw("RANDOM()")
          .first()
          .then((newCourse) => {
            return db("readcourse_table").insert({
              user_id: user.user_id,
              course_id: newCourse.course_id,
              // Add additional fields if necessary
            });
          });
      });

      return Promise.all(promises);
    })
    .then(() => {
      console.log("Daily topics and resources updated at 4 PM");
    })
    .catch((error) => {
      console.error("Error updating topics and resources:", error);
    });
});
