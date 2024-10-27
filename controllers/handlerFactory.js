const AppError = require('../utils/appError');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      //when wrong id, but mongoose return null (correct format of ID)
      return next(new AppError('No document found with that ID'), 404);
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true, //return new tour, not the previous old version - what is as default
      runValidators: true, //run Schema before update to be sure that the obj is correct
    });
    if (!doc) {
      //when wrong id, but mongoose return null (correct format of ID)
      return next(new AppError('No doc found with that ID'), 404);
    }

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // const selectedTour = tours.find((tour) => tour.id === parseInt(id));

    const { id } = req.params;
    const query = Model.findById(id); //add to stack generic findById - but it is a promise so it isnt a call (it need to be awaited)
    if (populateOptions !== undefined) {
      //if option is provided - add to stack populate
      query.populate(populateOptions);
    }
    const doc = await query;

    //    .populate({
    //     path: 'guides',
    //     select: '-__v -passwordChangetAt',
    //   }); //populate = fill up guides field 9in this case Users from UserModel

    if (!doc) {
      //when wrong id, but mongoose return null (correct format of ID)
      return next(new AppError('No document found with that ID'), 404);
    }

    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //allow nested routes for Reviews (hack) - to mach work to do it around
    let filterObj = {};
    if (req.params.tourId !== undefined) {
      filterObj = { tour: req.params.tourId };
    }

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .limitFields()
      .paginate()
      .sort(); // the chanining works beacuse in calss we return this - so return object on wichich we have this methods and we can chaining
    //3 - EXECUTE query
    const doc = await features.query; //* .explain() -> in response we will have additional dadta
    // console.log('allTours', allTours);

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { data: doc },
    });
  });
