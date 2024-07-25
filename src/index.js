import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:"./.env"
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running at ${process.env.PORT || 8000}`);
    })
})
.catch(error => {
    console.log("MongoDb connection failed" , error);
})


import routerInd from "./routes/index.routes.js";
app.use("/api/v1" , routerInd);