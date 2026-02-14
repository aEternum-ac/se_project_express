const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  getItems,
  createItem,
  likeItem,
  disLikeItem,
  deleteItemById,
} = require("../controllers/clothingItems");
const {
  validateItemId,
  validateCreateItem,
} = require("../middlewares/validator");

router.get("/", getItems);
router.use(auth);
router.post("/", validateCreateItem, createItem);
router.put("/:itemId/likes", validateItemId, likeItem);
router.delete("/:itemId/likes", validateItemId, disLikeItem);
router.delete("/:itemId", validateItemId, deleteItemById);

module.exports = router;
