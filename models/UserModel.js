const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


//name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
      trim: true,
    },
    slug: String,
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowecase: true,
      validate: [validator.isEmail, ' Please provide a valid email'],
    },
    photo: String,

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: [8, 'Password must have more or equeal then 8 characters'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // ONLY WORKS ON CREATE AND SAVE
        validator: function(el) {
          return el === this.password;
        },
        message: "Password are not the same"
      }
    },
    passwordChangedAt: Date
  }
);

userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();

})

userSchema.methods.correctPassword = async function(candidatePassword,userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  
  if (this.passwordChangedAt) {
    const changedTimeStam = parseInt(this.passwordChangedAt.getTime() /1000, 10);

    return JWTTimestamp < changedTimeStam;
  }
  
  return false;
}

const User = mongoose.model('User', userSchema);

module.exports = User;