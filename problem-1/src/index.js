const express = require("express");
const usersRouter = require("./routes/users.routes");
const postsRouter = require("./routes/posts.routes");

const app = express();

app.use(express.json());

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// routes
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
