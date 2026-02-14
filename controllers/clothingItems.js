const ClothingItem = require("../models/clothingItem");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

const handleItemError = (err, next) => {
  if (err.name === "ValidationError") {
    return next(new BadRequestError("Invalid data."));
  }
  if (err.name === "CastError") {
    return next(new BadRequestError("Invalid ID."));
  }
  if (err instanceof NotFoundError || err instanceof ForbiddenError) {
    return next(err);
  }

  return next(err);
};

module.exports.getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((clothingItems) => res.send({ data: clothingItems }))
    .catch((err) => handleItemError(err, next));
};

module.exports.createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((clothingItem) => res.status(201).send({ data: clothingItem }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid data."));
      }

      return handleItemError(err, next);
    });
};

module.exports.deleteItemById = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItem.findById(itemId)
    .orFail(() => new NotFoundError("Item not found"))
    .then((clothingItem) => {
      if (clothingItem.owner.toString() !== userId) {
        return next(
          new ForbiddenError(
            "You do not have permission to delete this item."
          )
        );
      }

      return ClothingItem.findByIdAndDelete(itemId)
        .then((deletedItem) => res.send({ data: deletedItem }))
        .catch((err) => handleItemError(err, next));
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid ID."));
      }
      if (err instanceof NotFoundError) {
        return next(err);
      }

      return handleItemError(err, next);
    });
};

module.exports.likeItem = (req, res, next) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => new NotFoundError("Item not found."))
    .then((item) => res.send({ data: item }))
    .catch((err) => handleItemError(err, next));

module.exports.disLikeItem = (req, res, next) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => new NotFoundError("Item not found."))
    .then((item) => res.send({ data: item }))
    .catch((err) => handleItemError(err, next));
