import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(404, "video id not found");

  const like = await Like.create({ video: videoId, likedBy: req.user });
  if (!like) throw new ApiError(504, "something went wrong on like");

  res.status(200).json(new ApiResponse(200, like, "Success"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) throw new ApiError(404, "comment id not found");

  const like = await Like.create({ comment: commentId, likedBy: req.user });
  if (!like) throw new ApiError(504, "something went wrong on comment like");

  res.status(200).json(new ApiResponse(200, like, "Success"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) throw new ApiError(404, "tweet id not found");

  const like = await Like.create({ tweet: tweetId, likedBy: req.user });
  if (!like) throw new ApiError(504, "something went wrong on tweet like");

  res.status(200).json(new ApiResponse(200, like, "Success"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const parsedLimit = parseInt(limit);
  const pageSkip = (page - 1) * parsedLimit;
  const allLikedVideos = await Like.find({ video: req.user._id })
    .skip(pageSkip)
    .limit(parsedLimit);
  if (!allLikedVideos)
    throw new ApiError(504, "something went wrong on video like");

  res.status(200).json(new ApiResponse(200, allLikedVideos, "Success"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
