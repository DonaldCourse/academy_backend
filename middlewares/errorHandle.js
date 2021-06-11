const ErrorResponse = require("../utils/errorResponse");

const errorHandle = (err, req, res, next) => {

    let error = { ...err};

    error.message = err.message;

    console.log(err);

    if (err.name === 'CastError') {
        const message = `Bootcamp not found with id ${err.value}`;
        error = new ErrorResponse(message, 404);
        
    }

    if (err.code === 11000 ) {
        const message = `Duplicate fiel value entered`;
        error = new ErrorResponse(message, 400);
        
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 404);
        
    }

    res.status(err.status || 500).json({
        success: false,
        status: err.status,
        error: err.message || 'Server interval'
    });
}

module.exports = errorHandle;