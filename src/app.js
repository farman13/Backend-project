import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))        // Parses incoming requests with JSON payloads.
app.use(express.urlencoded({ extended: true })) // Parses incoming requests with URL-encoded data (e.g., from HTML forms)
app.use(express.static("public"))   // Serves static files (like HTML, CSS, JS, images) from the public folder.
app.use(cookieParser())   // Parses cookies from the request headers and makes them available via req.cookies


// importing routes
import userRouter from "./routes/user.routes.js"

// routes declaration
app.use("/api/v1/users", userRouter);


export default app;