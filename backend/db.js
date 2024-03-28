const mongoose = require("mongoose");

// connects mongodb to our node app in index.js
const connectToMongo = async () => {
  mongoose
    .connect(
      "mongodb+srv://" +
      process.env.MONGO_USERNAME +
      ":" +
      process.env.MONGO_PASSWORD +
      "@cluster0.fgbii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )
    .then(() => {
      console.log("SUCCESS: Connected to mongo");
    })
    .catch((err) => {
      console.log("ERROR: Couldn't connect to mongo", err);
    });
};

module.exports = connectToMongo;
