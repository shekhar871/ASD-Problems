const express = require("express");
const router = express.Router();
const {
  create,
  list,
  getOne,
  update,
  remove,
  getPostLikesHandler,
} = require("../controllers/posts.controller");
const { like, unlike } = require("../controllers/likes.controller");

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);
router.get("/:id/likes", getPostLikesHandler);
router.post("/:id/likes", like);
router.delete("/:postId/likes/:userId", unlike);

module.exports = router;
