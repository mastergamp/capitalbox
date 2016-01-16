/**
 * Created by ivan on 20.10.15.
 */
var CustomError = function(status, text) {
    this.status = status || 404;
    this.statusText = text || 'Custom Error';
    this.custom = 1;
};

CustomError.prototype = Object.create(Error.prototype);
CustomError.prototype.constructor = CustomError;

module.exports = CustomError;