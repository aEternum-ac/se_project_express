require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const {errors} = require('celebrate');
const helmet = require("helmet");
const limiter = require("./middlewares/limiter");
const{ requestLogger, errorLogger } = require("./middlewares/logger");

const { PORT = 3001 } = process.env;

const app = express();

const User = require("./models/user");
const errorHandler = require("./middlewares/error-handler");


mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db", { autoIndex: true })
  .then(() => User.init());

app.use(cors({
  origin: "https://longvh12.crabdance.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

app.use(helmet());
app.use(limiter);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

app.use(requestLogger);

app.use("/", require("./routes/index"));

app.use(errorLogger);
app.use(errors());

app.use(errorHandler);

app.listen(PORT);
