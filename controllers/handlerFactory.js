const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError('No document found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: document,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError('No document found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        document: document,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const document = await query;

    if (!document) {
      return next(new AppError('No document found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document: document,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To Allow for nested get reviews on Tour
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    if (req.query.page) {
      const numDocuments = await Model.countDocuments();
      if (skip >= numDocuments) throw new Error('This page does not exist');
    }
    //EXECUTE QUERY
    const documents = await features.query;

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        documents: documents,
      },
    });
  });
