const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minLength: [10, 'A tour must have minimum 10 characters'],
      maxLength: [50, 'A tour must have maximum 50 characters'],
      //   validate: [validator.isAlpha, 'only letters a-z A-Z'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'A tour must have a difficulty: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
      set: (val) => Math.round(val * 10) / 10, //set rrun this fucntion after any changes happen to this value
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (valuePriceDiscount) {
          //This only points to current doc on NEW document - not on updated document!
          return valuePriceDiscount < this.price;
        },
        message: 'Discont price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a desription'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //pernamently hide this parameter - no send to client, hided
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // just casual data of the Model, without id's on creation
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], //only points available
      },
      coordinates: [Number],
      adress: String,
      description: String,
    },
    locations: [
      //embended data - in mongoose it is simply array of object. Moongose will create Id's for each of this
      {
        //GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'], //only points available
        },
        coordinates: [Number],
        adress: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    //!no, beacuse we use virtuals populate to not store potencial big array here.
    // reviews: [
    //     {
    //       type: mongoose.Schema.ObjectId,
    //       ref: 'Review',
    //     },
    //   ],
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
tourSchema.index({ price: 1, ratingsAverage: -1 }); //! indexing is method that in mongoDB has array of values - eg _id indexes are automatic createdd and mongoDB start scan first this array of inexed _id's and then whole documents (which is much slower). When provided more fields it will be also combained togeher as solo too
tourSchema.index({ slag: 1 }); //! indexing is method that in mongoDB has array of values - eg _id indexes are automatic createdd and mongoDB start scan first this array of inexed _id's and then whole documents (which is much slower). When provided more fields it will be also combained togeher as solo too
tourSchema.index({ startLocation: '2dsphere' }); //! indexing is method that in mongoDB has array of values - eg _id indexes are automatic createdd and mongoDB start scan first this array of inexed _id's and then whole documents (which is much slower). When provided more fields it will be also combained togeher as solo too

//this propertis arent save to db, eq we have days an we can caluate it to weeks
tourSchema.virtual('durationWeeks').get(function () {
  //normal function beacuse we are using THIS keyword in this function
  return this.duration / 7;
});

//virtual popualate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //field in (ref' Review), field in other model - here in Review, where mongoose need to search (we have there ids of tours)
  localField: '_id', //where id is stored in the current model. Because mongoose need to know what parameter serach for in Review's tour field. It could be insted of _id sth diffrent, eg in reviewModel we could store
});

//MONGOOSE middlewares
tourSchema.pre('save', function (next) {
  //document middlaware:
  //runs before .save() and . .create()
  //NOT before insertMany()
  //this keywors refers to current processing document
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre(/^find/, function (next) {
  //document middlaware:
  //runs before .any route starts with find -> eg findById
  //NOT before insertMany()
  //this keywors refers to current processing document
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangetAt',
  });
  //   .populate({
  //     path: 'reviews',
  //     select: '-__v -user -tour',
  //   }); //populate = fill up guides field 9in this case Users from UserModel
  next();
});

// tourSchema.pre('save', async function (next) {
//     //! guides Users embeded in tour Model. Example! This approuch isnt best here, beacuse if user change eg role we need fin all referenced tours and upadte it
//   //*populate tour by referencing id's of users which are leads of this tour
//   //document middlaware:
//   //runs before .save() and . .create()
//   //NOT before insertMany()
//   //this keywors refers to current processing document

//   const guidesPromises = this.guides.map((id) => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//QUERY MIDDLEWARE
// tourSchema.pre(/^find/, (next) => {
//   //RegExp -> all strings that starts with 'find'
//   //   this.find({ secretTour: { $ne: true } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
