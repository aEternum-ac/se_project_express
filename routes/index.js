const router = require("express").Router();
const { createUser, loginUser } = require("../controllers/users");
const {validateLogin, validateSignUp} = require("../middlewares/validator");
const { NotFoundError } = require("../utils/errors");

router.post("/signin", validateLogin, loginUser);
router.post("/signup", validateSignUp, createUser);
router.use("/users", require("./users"));
router.use("/items", require("./clothingItems"));

router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
