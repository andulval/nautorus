const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //limit to one review for user at the same tour

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

//static method -- DOCUMENT middleware
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //this function si available on Model directly eg. Review.calcAverageRatings()
  //* this is model - aggragate have to be called on Model directly
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, //select tour we want to update
    },
    {
      $group: {
        //id- field that is a common thru all instances within the model
        _id: '$tour',
        nRating: { $sum: 1 }, //add 1 for any selected tour - so this is a counter
        avgRating: { $avg: '$rating' }, //calc average of this field
      },
    },
  ]);
  //   console.log('calcAverageRatings', stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    //if no reviews on this tour - set default
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  //!post middleware beacuse we calculate after creation (nomongoose not saved yet)
  //'this' keyword point to current document which is being save
  this.constructor.calcAverageRatings(this.tour);
  //this points to current document (review) but we doesnt created any yet! in the next
  //this.constructor -> points to Model which created this istance of the model -> so in this case Review
  //*this.tour -> is current review with field 'tour' so then mongoose will run aggragate for this field
});

// query middleware, because we have enents start with '^findOne' - so this is query!
//findOneAndUpdate
//findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //we CANT do it by .post middleware beacuse in post middleware query is already executed so we have not access to the query, so we dont have posibility to update ratings.. So we use also .post middleware with data send from this .pre query middleware
  //'this' is the current query
  //*but when we execute query we will get Model! so we do it - we retrieving a document from a DB
  this.reviewFromQueryPremiddleware = await this.findOne(); //we create 'r' property on this variable
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  //*we will receive data on model from pre(/^findOneAnd/ which is attached to the object thru all middlewares
  await this.reviewFromQueryPremiddleware.constructor.calcAverageRatings(
    reviewFromQueryPremiddleware.tour,
  );
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
