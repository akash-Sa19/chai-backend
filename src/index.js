// we are using dotenv package to create the availability of .env variable everywhere, right after the page load
// old way of loading .env variable - down
// require("dotenv").config({ path: "./env" });
// OR
import dotenv from "dotenv";

import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});
connectDB();

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
