const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('../models/userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: [true, 'A tour must have Name'],
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [
        10,
        'A tour name must have greater or equal then 10 characters'
      ]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, 'ratingsQuantity must be equal or above 0']
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // This only points to current doc on NEW document creation
          return val < this.price;
        }
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have image cover']
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: { values: ['Point'], message: 'Only point are allowed' }
      },
      coordinates: {
        type: [Number]
      },
      description: String,
      address: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: { values: ['Point'], message: 'Only point are allowed' }
        },
        coordinates: {
          type: [Number]
        },
        description: String,
        address: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }
  } // virtual properties setting so it can appear in the result
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startDates: '2dsphere' });
// Virtual properties are defined so that space can be saved because it can be calculated at runtime
tourSchema.virtual('durationWeeks').get(function() {
  return (this.duration / 7).toFixed(2);
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// Mongoose Middlewares:
// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  this.executionTime = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: 'name role photo -_id'
  });
  next();
});

// will execute after saving the document
tourSchema.post('save', function(doc, next) {
  // eslint-disable-next-line no-console
  console.log(`${Date.now() - this.executionTime} milliseconds taken`);
  next();
});

// QUERY MIDDLEWARE will return query object with this regular expression will run for method findOne,find both
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// AGGREGATION MIDDLEWARE return aggregation pipeline
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
