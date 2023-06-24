const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const gptController = require("./controllers/gptController");

const app = express();

app.use(cors());

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000,
  })
);
app.use(bodyParser.json({ limit: "50mb", parameterLimit: 100000 }));
app.use(bodyParser.text({ limit: "50mb" }));

app.use("/getAnswers", gptController.getAnswer);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
