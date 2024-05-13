import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const channelStats = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "likedBy",
              as: "likes",
              pipeline: [
                {
                  $addFields: {
                    Videolikes: {
                      $size: "$likes",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalViews: {
          $sum: "$videos.views",
        },
        totalLikes: {
          $sum: "$videos.VideoLikes",
        },
        totalVideos: {
          $size: "$videos",
        },
      },
    },
  ]);

  if (!channelStats) throw new ApiError(500, "data not found");

  res.status(200).json(new ApiResponse(200, channelStats, "Success"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const totalVideos = await Video.find({ owner: req.user._id });
  if (!totalVideos) throw new ApiError(500, "videos are not available");

  res.status(200).json(new ApiResponse(200, totalVideos, "Success"));
});

export { getChannelStats, getChannelVideos };
