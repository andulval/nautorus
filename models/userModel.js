const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A User must have a name'],
      trim: true,
      //   minLength: [10, 'A User must have minimum 10 characters'],
      //   maxLength: [50, 'A User must have maximum 50 characters'],
      //   validate: [validator.isAlpha, 'only letters a-z A-Z'],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'A User must have a email'],
      validate: [validator.isEmail, 'It is not valid email'],
    },
    password: {
      type: String,
      minLength: [6, 'Password reaquire atleast 6 characters'],
      required: [true, 'A User must have a password'],
      //   maxLength: [40, 'A tour must have maximum 50 characters'],
      //   validate: [
      //     validator.isStrongPassword,
      //     'Password requirements: minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10',
      //   ],
      select: false, //not shown when get documents from DB - force to get data use: .select('+password')
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Passwords are not the same.'],
      validate: {
        validator: function (valuePasswordConfirm) {
          //this only works on create and  save! This only points to current doc on NEW document - not on updated document!
          return valuePasswordConfirm === this.password;
        },
        message: 'Passwords must be the same',
      },
    },
    photo: [String],
    passwordChangetAt: Date,
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  //   {
  //     toJSON: {
  //       virtuals: true,
  //     },
  //     toObject: {
  //       virtuals: true,
  //     },
  //   },
);

userSchema.pre('save', async function (next) {
  //run before every User.save() call
  if (!this.isModified('password') || this.isNew) return next(); //if not modified or new user is creating - do nothing

  this.passwordChangedAt = Date.now() - 1000; //minus 1 ssecond because: //sometimes issue JWT is shorter than saving to DB, which could case problem with login user after reset token (changedPasswordAfter)
  next();
});

//MONGOOSE middlewares
userSchema.pre('save', async function (next) {
  //console.log('in pre userChema');
  //if password was not modified
  if (!this.isModified('password')) return next();

  //encrypt / hash password
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined; //remove confirm password
  next();
});

//INSTANCE method - available for all documents of user collection eg. user.correctPassword(...) witout export it
userSchema.methods.correctPassword = async function (
  candidatePassword, //this password is comming from user
  userPassword, //from DB - this.password not available beacuse of select: false in userSchema, therefor we have 2 arguments here
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (
  //! tu dałem async i wyrzucło bład .. bo return promise w pending stanie ajko ze przy wywołaniu funkcji nie bylo await
  JWTtimestamp, //from token - iat - issue at
) {
  if (this.passwordChangedAt) {
    //some users can doesnt have this parameter in DB - never changed etc - so we test it here
    const secondsPasswordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    // console.log('changedPasswordAfter', JWTtimestamp, secondsPasswordChangedAt);
    return JWTtimestamp < secondsPasswordChangedAt; //if paassword was changedafter token was created - so now we should ask to generate new token, no use old one which isnt correct bacuse user has difffrent credentail (beacuse eq stolen password and user change it)
  }
  //   console.log(
  //     'changedPasswordAfter passwordChangedAt negative',
  //     this.passwordChangedAt,
  //   );
  //false meant not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //plain reset token
  //now in case that hacker will gain access to DB, we need hash our reset token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes

  return resetToken;
};

userSchema.methods.changedPasswordWithin10min = async function () //!
{
  if (this.passwordChangedAt) {
    //some users can doesnt have this parameter in DB - never changed etc - so we test it here
    const secondsPasswordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTtimestamp < secondsPasswordChangedAt; //if paassword was changedafter token was created - so now we should ask to generate new token, no use old one which isnt correct bacuse user has difffrent credentail (beacuse eq stolen password and user change it)
  }

  //false meant not changed
  return false;
};

//QUERY MIDDLEWARE
// tourSchema.pre(/^find/, (next) => {
//   //RegExp -> all strings that starts with 'find'
//   //   this.find({ secretTour: { $ne: true } });
//   next();
// });

const User = mongoose.model('User', userSchema);
module.exports = User;
