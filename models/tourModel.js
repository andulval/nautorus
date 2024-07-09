const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
const User = require('./userModel');

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
    guides: Array,
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

//this propertis arent save to db, eq we have days an we can caluate it to weeks
tourSchema.virtual('durationWeeks').get(function () {
  //normal function beacuse we are using THIS keyword in this function
  return this.duration / 7;
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
tourSchema.pre('save', function (next) {
  //*populate tour by referencing id's of users which are leads of this tour
  //document middlaware:
  //runs before .save() and . .create()
  //NOT before insertMany()
  //this keywors refers to current processing document

  const guides = this.guides.map(async id => await User.findById(id))

  this.guides = guides
  next();
});

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, (next) => {
  //RegExp -> all strings that starts with 'find'
  //   this.find({ secretTour: { $ne: true } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
