// const fs = require('fs');
const Tour = require('../models/tourModel');

const AppError = require('../utils/appError');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handleFactory = require('./handlerFactory');

//! 2 - ROUTES HANDLERS
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// exports.checkBodyTour = (req, res, next) => {
//   //   const { name, price } = req.body;
//   //   console.log('check body!', name, price);
//   //   if (!name || !price) {
//   //     return res
//   //       .status(400)
//   //       .json({ status: 'fail', description: 'body is no valid' });
//   //   }
//   next();
// };

// exports.checkID = (req, res, next, val) => {
//   //   if (req.params.id * 1 > tours.length || req.params.id * 1 < 1) {
//   //     return res
//   //       .status(404)
//   //       .json({ status: 'fail', description: 'id not found' });
//   //   }

//   next(); //only when ID is present in DB. otherwise above 'return' will abort any other middlewares
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        //all statisctics for all tours - take each and make calcs as below
        _id: { $toUpper: '$difficulty' }, //create only one big group - use -> null
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1, //for descending order
      },
    },
    //   { //we can match many times- here after agragation and init cals
    //     $match: {
    //       _id: { $ne: 'EASY' },
    //     },
    //   },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats: stats },
  });
});

exports.getMonthPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; ///month-plan/2021 -> /month-plan/:year
  const plan = await Tour.aggregate([
    {
      $unwind: {
        path: '$startDates',
      },
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        //all statisctics for all tours - take each and make calcs as below
        _id: { $month: '$startDates' }, //create only one big group - use -> null
        numToursPerMonth: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0, //0 to hide this field -> 1 to show
      },
    },
    {
      $sort: {
        numToursPerMonth: -1, //for descending order
      },
    },
    {
      $limit: 12, //how many objects to show
    },
    //   { //we can match many times- here after agragation and init cals
    //     $match: {
    //       _id: { $ne: 'EASY' },
    //     },
    //   },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: { stats: plan },
  });
});

exports.updateTour = handleFactory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const tour = await Tour.findByIdAndUpdate(id, req.body, {
//       new: true, //return new tour, not the previous
//       runValidators: true, //run Schema before update to be sure that the obj is correct
//     });
//     if (!tour) {
//       //when wrong id, but mongoose return null (correct format of ID)
//       return next(new AppError('No tour found with that ID'), 404);
//     }

//     res.status(200).json({
//       status: 'success',
//       data: { tour: tour },
//     });
//   });

exports.removeTour = handleFactory.deleteOne(Tour);
// exports.removeTour = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const tour = await Tour.findByIdAndDelete(id);
//   if (!tour) {
//     //when wrong id, but mongoose return null (correct format of ID)
//     return next(new AppError('No tour found with that ID'), 404);
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.createTour = handleFactory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: { tour: newTour },
//   });

//   //   try {
//   //     const newTour = await Tour.create(req.body);

//   //     res.status(201).json({
//   //       status: 'success',
//   //       data: { tour: newTour },
//   //     });
//   //   } catch (error) {
//   //     res.status(400).json({
//   //       status: 'fail',
//   //       message: error,
//   //     });
//   //   }
// });

exports.getTour = handleFactory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   // const selectedTour = tours.find((tour) => tour.id === parseInt(id));

//   const { id } = req.params;
//   const tour = await Tour.findById(id).populate('reviews');
//   //    .populate({
//   //     path: 'guides',
//   //     select: '-__v -passwordChangetAt',
//   //   }); //populate = fill up guides field 9in this case Users from UserModel

//   if (!tour) {
//     //when wrong id, but mongoose return null (correct format of ID)
//     return next(new AppError('No tour found with that ID'), 404);
//   }

//   res.status(200).json({
//     status: 'success',
//     data: { tour: tour },
//   });
// });

exports.getAllTours = handleFactory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//     //1 - build query
//     //1a filtering
//     // const queryObj = { ...req.query };
//     // const excludedFields = ['limit', 'page', 'sort', 'fields'];
//     // excludedFields.forEach((element) => delete queryObj[element]);
//     // //or just destructuring:
//     // // const { page, sort, limit, fields, ...queryObj } = req.query;

//     // //1b advanced filtering
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//     // // \b - exac word (nie słowa zawierajce np. lte -> lt)
//     // //( | | | ) -> | oznacza 'lub'
//     // // /g - muliple times
//     // const objToSearch = JSON.parse(queryStr);
//     // let query = Tour.find(objToSearch);
//     // //?WHY? why not await?  -> thenable object is the simplest thing in the world:
//     // // Any object that has a method named “then” is called a “thenable” object.
//     // //a mongoose uzywa wlasnie thenable a nie Promises
//     // //wiec tutaj - do kiedy nie wywołamy funkcji then na obiekcie Query monggose
//     // //co dzieje sie przy 'await' to nie jest wyzwalana funckja asynchroniczna
//     // //tylko zapisujemy obiekt Query z  odpowiednimi parametrami

//     // //2 - sorting
//     // if (req.query.sort) {
//     //   //monggose sort - eg: sort=price
//     //   //   console.log('sort', req.query.sort);
//     //   //   console.log('sort ,', req.query.sort.split(','));
//     //   //   console.log('sort ,', req.query.sort.split(',').join(' '));
//     //   const sortBy = req.query.sort.split(',').join(' '); //make query required from mongoose
//     //   query = query.sort(sortBy);
//     // } else {
//     //   query = query.sort('-createdAt');
//     // }
//     // //3 - field limiting (select fields)
//     // if (req.query.fields) {
//     //   //monggose fields - eg: fields=price -> shows only price parameter for tours
//     //   //   console.log('fields', req.query.fields);
//     //   //   console.log('fields ,', req.query.fields.split(','));
//     //   //   console.log('fields ,', req.query.fields.split(',').join(' '));
//     //   const limitBy = req.query.fields.split(',').join(' '); //make query required from mongoose
//     //   query = query.select(limitBy);
//     // } else {
//     //   query = query.select('-__v');
//     // }

//     // //4 - pagination
//     // const page = req.query.page * 1 || 1; //convert to Number or when undefined select 1
//     // const limit = req.query.limit * 1 || 10; //convert to Number or when undefined select 1
//     // const skip = (page - 1) * limit; //limit * page - limit;
//     // query = query.skip(skip).limit(limit);

//     // if (req.query.page) {
//     //   const numTours = await Tour.countDocuments();
//     //   if (skip >= numTours) throw new Error("This page doesn't exist");
//     // }

//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .limitFields()
//       .paginate()
//       .sort(); // the chanining works beacuse in calss we return this - so return object on wichich we have this methods and we can chaining
//     //3 - EXECUTE query
//     const allTours = await features.query;
//     // console.log('allTours', allTours);

//     res.status(200).json({
//       status: 'success',
//       results: allTours.length,
//       data: { tours: allTours },
//     });
//   });
