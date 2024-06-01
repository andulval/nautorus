module.exports = (func) => (req, res, next) => {
  func(req, res, next).catch(next); //asyn functions return promis so we can chain catch block to catch error and then thru next function with error argument it will call our global express error function (with 4 parameters - err at the beginning)
  //in catch when we have function -> then it will be automatic called with agrument provided to catch block - so here with error
  //   func(req, res, next).catch((error) => next(error));
}; //func returns anymous func which will be called by express when route will be hit
