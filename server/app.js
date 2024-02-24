const express = require("express");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const userRouter = require("./routes/users");
const endpointRouter = require("./routes/endpoints");

app.use("/users", userRouter);
app.use("/endpoints", endpointRouter);

app.listen(3000);
