// the code below and the code commented out are the same
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    // OR
    // .reject((err) => next(err))
  };
};

export { asyncHandler };

// const asyncHandler = () => {}
// const asyncHandler = (fn) => {() => {}}
// OR
// const asyncHandler = (requestHandler) => () => {}

// const asyncHandler = (requestHandler) => async (req, res, next) => {
//   try {
//     await requestHandler(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
