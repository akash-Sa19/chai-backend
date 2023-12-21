import express from "express";
import cors from "cors";
// the package cookie-parser is used to perform curd operation on the cookies of the user in browser
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// this middleware is used to limit the json data size to 16kb
app.use(express.json({ limit: "16kb" }));

// configuration for url encoder ( that incode data to the url)
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// this congiguration is declaring to use public folder, to access all static files like images, svg etc
app.use(express.static("public"));

// the package cookie-parser is used to perform curd operation on the cookies of the user in browser
app.use(cookieParser());

export { app };
