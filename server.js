require('dotenv').config();
const express = require('express');
const app = express();  
const connectToDB = require("./database/db");
const authRoutes = require("./routes/auth-routes");
const homeRoutes = require("./routes/home-routes");
const adminRoutes = require("./routes/admin-routes");
const uploadImageRoutes = require("./routes/image-routes");
connectToDB();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/admin", adminRoutes);

app.use("/api/auth",authRoutes); //main route for authentication & authorization
app.use("/api/home",homeRoutes);
app.use("/api/image",uploadImageRoutes); 

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
} );