// we are using dotenv package to create the availability of .env variable everywhere, right after the page load
// old way of loading .env variable - down
// require("dotenv").config({ path: "./env" });
// OR
import dotenv from "dotenv";

import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

// this async function returns a promise
connectDB()
  .then(() => {
    app.on("error", () => {
      console.log("Error:", error);
      throw error;
    });

    app.listen(process.env.PORT || 7000, () => {
      console.log(`server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log("DB connection error src->index.js :", error));

// ------------------------------------------------------
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
// const app = express();

/*
// to add a semicolon before a iffi (immediately invoking function Expression) is professional approch
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", () => {
      console.log("ERROR:", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error : error");
    throw err;
  }
})();

*/
