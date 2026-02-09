import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save refreshToken in db
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(500, error.message);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;
  if (!username) {
    throw new ApiError(400, "username is required");
  }
  if (!fullname) {
    throw new ApiError(400, "fullname is required");
  }
  if (!email) {
    throw new ApiError(400, "email is required");
  }
  if (!password) {
    throw new ApiError(400, "password is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "username or email already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    email: email.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id,
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
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
        "user loggedin successfully",
      ),
    );
});

const getProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User profile fetched successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, fullname, email } = req.body;
  const updateUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username: username,
        fullname: fullname,
        email: email
      },
    },
    { new: true },
  ).select("-password");

  if (!updateUser) {
    throw new ApiError(500, "Something went wrong while updating profile");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updateUser, "Profile updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new passwords are required");
  }
  const user = await User.findById(req.user._id);
  const checkPassword = await user.isPasswordCorrect(oldPassword);
  if (!checkPassword) {
    throw new ApiError(401, "Old password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  updateProfile,
  changePassword,
};
