  const express = require("express");
  const morgan = require("morgan");
  const bodyParser = require("body-parser");
  const mongoose = require("mongoose");
  const dotenv = require("dotenv");
  var cors = require("cors");

  dotenv.config();

  const app = express();
  app.use(cors());

  // Connect to DB
  mongoose.connect("mongodb://localhost/productDB")

  // Middleware
  app.use(morgan("dev"));
  app.use(bodyParser.json());
  app.use(
      bodyParser.urlencoded({
          extended: false,
      })
  );

  // Require APIs
  const authRoutes = require("./routes/auth");
  const companyRoutes = require("./routes/company");
  const contactRoutes = require("./routes/contact");
  const itemRoutes = require("./routes/item");
  const quoteRoutes = require("./routes/quote");

  app.use("/", authRoutes);
  app.use("/", companyRoutes);
  app.use("/", contactRoutes);
  app.use("/", itemRoutes);
  app.use("/", quoteRoutes);



  app.listen(2000, () => {
      console.log("Server is Runing On port 2000");
  });