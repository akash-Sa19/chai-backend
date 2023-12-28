import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  /*
    get user details from fontend
    validation - ( should not be empty )
    check if user already exists : username, email
    check for images, check for avatar
    upload then to cloudinary, (check avatar)
    create user object - create entry in db
    remove password and refresh token field from response 
    check for user creation 
    return res

  */
  const { fullName, email, username, password } = req.body;
  // console.log("email : ", email);
  // console.log("password : ", password);

  // beginner way to check for validation
  // if (fullName === "") {
  //   throw new ApiError(400, "fullname is required");
  // }

  // industry standard to validation request post data from user
  // some method -> determins wheather the specified callback function returns true for any of the elements of the array
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, ` ${field} field is required`);
  }

  // findOne method return the first match
  // "$or" are mongoose operator
  //  this methods checks for the if their a user exist by the same username and email
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }

  //  "files" method comes from the middleware
  //  beacuse we are using "upload" middleware in user.routes.js
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const User = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // concept - mongoose create _id for each model entry, if the User id created their will be a _id for that entry
  // the syntax used in select is wierd bu it is what it is
  // by default all feilds are selected but bu using negation sign we are avoiding password and refreshToken
  const createdUser = await User.findById(User._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));

  // res.status(200).json({
  //   message: "chai our code",
  // });
});

export { registerUser };
