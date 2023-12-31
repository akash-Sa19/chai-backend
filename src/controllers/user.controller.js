import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    // console.log(user);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // this validteBeforeSave (true -> default) is set to false, because what this method do is check if all types, and required key are serverd
    // since we are only providing refreshToken's value in the model, that why we set it to false (to prevent errors)
    await user.save({ validateBeforeSave: false });
    // console.log(accessToken);
    // console.log(refreshToken);
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token"
    );
  }
};

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
  // console.log(req.body);
  // console.log(req.files);

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
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists");
  }

  //  "files" method comes from the middleware
  //  beacuse we are using "upload" middleware in user.routes.js
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // problem with the code below, error when cover image is not send
  //  (as we know that avatar to require), but when coverImage is not send in request,
  // the code still access the files (which was optional chained), and not found "coverImage[0]" their which war throwing an error
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // console.log(avatar);
  // console.log(coverImage);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    // Imp concept - down
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // concept - mongoose create _id for each model entry, if the User id created their will be a _id for that entry
  // the syntax used in select is wierd bu it is what it is
  // by default all feilds are selected but bu using negation sign we are avoiding password and refreshToken
  const createdUser = await User.findById(user._id).select(
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

// response print
// console.log(req.files); -> down

// this object contains two properties (avatar) and (coverimage)
// [Object: null prototype] {
// avatar: [
//     {
//       fieldname: 'avatar',
//       originalname: 'IMG_5727.jpg',
//       encoding: '7bit',
//       mimetype: 'image/jpeg',
//       destination: './public/temp',
//       filename: 'IMG_5727.jpg',
//       path: 'public\\temp\\IMG_5727.jpg',
//       size: 2024528
//     }
//   ],
//   coverImage: [
//     {
//       fieldname: 'coverImage',
//       originalname: 'IMG_5728.jpg',
//       encoding: '7bit',
//       mimetype: 'image/jpeg',
//       destination: './public/temp',
//       filename: 'IMG_5728.jpg',
//       path: 'public\\temp\\IMG_5728.jpg',
//       size: 2398029
//     }
//   ]
// }

// console.log(req.body); -> down
// [Object: null prototype] {
//   email: 'b@b.com',
//   username: 'bb',
//   password: '1234',
//   fullName: 'bbb'
// }

// console.log(avatar); -> down
// {
//   asset_id: '4eb5ff9ddd46ba6b5712bce2f0676e30',
//   public_id: 'esczluk1dh9o6irw1jos',
//   version: 1703780508,
//   version_id: '8e7e8b490f717e61938b6bfa4cfd46b9',
//   signature: '483d8a8cb3db1938b20b0810f696d2b756e6aa81',
//   width: 6960,
//   height: 4640,
//   format: 'jpg',
//   resource_type: 'image',
//   created_at: '2023-12-28T16:21:48Z',
//   tags: [],
//   bytes: 2024528,
//   type: 'upload',
//   etag: 'fdcdcbd0fb5874c3301557d3c88ced96',
//   placeholder: false,
//   url: 'http://res.cloudinary.com/dx5r39uyf/image/upload/v1703780508/esczluk1dh9o6irw1jos.jpg',
//   secure_url: 'https://res.cloudinary.com/dx5r39uyf/image/upload/v1703780508/esczluk1dh9o6irw1jos.jpg',
//   folder: '',
//   original_filename: 'IMG_5727',
//   api_key: '398553524726635'
// }

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // accessToken and RefreshToken
  // send cookies

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or password is required");
  }

  // $and $comment $nor $or $text $where
  // all are mongoDB operator
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "user does not exists");
  }

  // point to note - we are using the "user" not "User", because "User" is a object provided by mongoose
  // and to access the user method defined in user.model.js we have to use "user" object which we have initilized using -> "findOne" method
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid user crediential");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // why we needed to call server one more time ?
  // ->because that instance of the user does not contain refreshToken
  // optional step as we are skiping the refresh Token
  const loggedInUser = await User.findById(user.id).select(
    "-password -refreshToken"
  );

  // this two option prevent the modification of cookies from the fontend and can only be modified by server (or in the backend)
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // clear cookies from the browser
  // clear refreshToken from the user.model

  // this findByIdAndUpdate takes three arg
  // 1 -> id
  // 2 -> (object) value that you want to update
  // 3 -> (object) more configuration
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      // this configure return the new updated value
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookies("accessToken", options)
    .clearCookies("refreshToken", options)
    .json(new ApiResponse(200, {}, "user loggedOut successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    //  The function takes three arguments: the token to be verified or decoded, the secret or public key, and an optional object containing verification options
    // Example -> jwt.verify(token, secret, function (err, decoded) {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     console.log(decoded);
    //   }
    // });
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.messsage || "Invalid refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched succesfully ");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All feilds are required");
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    // { $set: {
    //   fullName,
    //   email,
    // }
    // },
    // or
    { $set: { fullName: fullName, email: email } },
    {
      // this will send the updated data as a response for using this method
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Acount details successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.files?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.files?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "error while uploading on coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  changeCurrentPassword,
  updateAccountDetails,
};
