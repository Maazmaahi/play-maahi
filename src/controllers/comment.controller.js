import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(404, "video id is missing");
  const { page = 1, limit = 10 } = req.query;
  const parsedLimit = parseInt(limit);
  const pageSkip = (page - 1) * parsedLimit;

  const allComments = await Comment.aggregate([
    {
      $match: {
        video: videoId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              userName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $skip: pageSkip,
    },
    {
      $limit: parsedLimit,
    },
  ]);

  if (!allComments) throw new ApiError(504, "comments not found");

  res
    .status(200)
    .json(new ApiResponse(200, allComments, "comment fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId || !content)
    throw new ApiError(404, "video id or content is missing");

  const comment = await Comment.create({
    content,
    owner: req.user,
    video: videoId,
  });

  if (!comment) throw new ApiError(504, "comment not created");

  res.status(200).json(new ApiResponse(200, comment, "commented successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId || !content)
    throw new ApiError(404, "video id or content is missing");

  const comment = await Comment.findById(videoId);

  // Check if the playlist exists
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if the user is the owner of the playlist
  if (comment.owner !== req.user) {
    throw new ApiError(403, "You are not allowed for this playlist");
  }

  comment.content = content;

  try {
    await comment.save();
  } catch (error) {
    throw new ApiError(503, ` not updated ${error}`);
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "comment update successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(404, "video id is missing");

  const comment = await Comment.findById(videoId);

  // Check if the playlist exists
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if the user is the owner of the playlist
  if (comment.owner !== req.user) {
    throw new ApiError(403, "You are not allowed for this playlist");
  }

  try {
    await comment.remove();
  } catch (error) {
    throw new ApiError(503, `  ${error}`);
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "comment delete successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
