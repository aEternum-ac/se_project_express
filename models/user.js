const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const {
  UnauthorizedError,
} = require("../utils/errors");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "You must enter a valid email address.",
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "You must enter a valid URL.",
    },
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  if(!validator.isEmail(email)){
    return Promise.reject(new UnauthorizedError("Incorrect email or password."));
  }

  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new UnauthorizedError('Incorrect email or password.')
        );
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new UnauthorizedError("Incorrect email or password.")
          );
        }
        return user;
      });
    });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
