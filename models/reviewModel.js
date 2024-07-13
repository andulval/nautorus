const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must have a review'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //pernamently hide this parameter - no send to client, hided
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must have a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must have a user'],
    },
  },
  {
    toJSON: {
      virtuals: true, //we want show virtuals - fields NOT stored in a DB, but calculated some other values
    },
    toObject: {
      virtuals: true, //we want show virtuals - fields NOT stored in a DB, but calculated some other values
    },
  },
);

//MONGOOSE middlewares
reviewSchema.pre(/^find/, function (next) {
  //document middlaware:
  //runs before .any route starts with find -> eg findById
  //NOT before insertMany()
  //this keywors refers to current processing document
  //! there is population chaining where request getSpecificTour - tour populate review, review populate tours and users, then review populate guides...
  //so we need to decide what in this case make sense and do we need so many informations for tour? We decide we dont need tour info on reviews, but we need reviews on tours.
  //   this.populate({
  //     path: 'tour',
  //     select: 'name', //just name
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo', //just name and photo
  //   }); //populate = fill up guides field 9in this case Users from UserModel
  this.populate({
    path: 'user',
    select: 'name photo', //just name and photo
  }); //populate = fill up guides field 9in this case Users from UserModel
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
