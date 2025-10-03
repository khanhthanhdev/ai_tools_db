import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";
import { Doc, Id } from "./_generated/dataModel";

const reviewTextValidator = v.optional(v.string());

export const createReview = mutation({
  args: {
    toolId: v.id("aiTools"),
    rating: v.number(),
    reviewText: reviewTextValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);

    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_user_and_tool", (q) =>
        q.eq("userId", user._id).eq("toolId", args.toolId)
      )
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this tool.");
    }

    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }

    const reviewId = await ctx.db.insert("reviews", {
      userId: user._id,
      toolId: args.toolId,
      rating: args.rating,
      reviewText: args.reviewText,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      helpfulCount: 0,
    });

    await ctx.db.patch(args.toolId, {
      totalReviews: (tool.totalReviews ?? 0) + 1,
      ratingSum: (tool.ratingSum ?? 0) + args.rating,
      averageRating:
        ((tool.ratingSum ?? 0) + args.rating) /
        ((tool.totalReviews ?? 0) + 1),
    });

    return reviewId;
  },
});

export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.number(),
    reviewText: reviewTextValidator,
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== user._id) {
      throw new Error("You are not authorized to edit this review.");
    }

    const tool = await ctx.db.get(review.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }

    const oldRating = review.rating;
    await ctx.db.patch(args.reviewId, {
      rating: args.rating,
      reviewText: args.reviewText,
      updatedAt: Date.now(),
    });

    const ratingSum = (tool.ratingSum ?? 0) - oldRating + args.rating;
    await ctx.db.patch(review.toolId, {
      ratingSum: ratingSum,
      averageRating: ratingSum / (tool.totalReviews ?? 1),
    });
  },
});

export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    if (review.userId !== user._id) {
      throw new Error("You are not authorized to delete this review.");
    }

    const tool = await ctx.db.get(review.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }

    await ctx.db.delete(args.reviewId);

    const ratingSum = (tool.ratingSum ?? 0) - review.rating;
    const totalReviews = (tool.totalReviews ?? 1) - 1;

    await ctx.db.patch(review.toolId, {
      totalReviews: totalReviews,
      ratingSum: ratingSum,
      averageRating: totalReviews > 0 ? ratingSum / totalReviews : 0,
    });
  },
});

export const getToolReviews = query({
  args: {
    toolId: v.id("aiTools"),
    sortBy: v.optional(v.union(v.literal("recent"), v.literal("helpful"))),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { toolId, sortBy = "recent", limit = 10 } = args;

    let query;
    if (sortBy === 'helpful') {
      query = ctx.db
        .query("reviews")
        .withIndex("by_tool_and_helpful", (q) => q.eq("toolId", toolId))
        .order("desc");
    } else {
      query = ctx.db
        .query("reviews")
        .withIndex("by_tool_and_created", (q) => q.eq("toolId", toolId))
        .order("desc");
    }

    const result = await query.paginate({
        cursor: args.cursor ?? null,
        numItems: limit
    });

    const pageWithAuthors = await Promise.all(
        result.page.map(async (review) => {
            const author = await ctx.db.get(review.userId);
            return {
                ...review,
                author,
            };
        })
    );

    return {
        ...result,
        page: pageWithAuthors,
    };
  },
});

export const getUserReviewForTool = query({
    args: {
        toolId: v.id("aiTools"),
    },
    handler: async (ctx, args) => {
        try {
            const user = await getUser(ctx);
            const review = await ctx.db.query("reviews")
                .withIndex("by_user_and_tool", q => q.eq("userId", user._id).eq("toolId", args.toolId))
                .first();
            return review;
        } catch (error) {
            return null;
        }
    }
});

export const toggleReviewVote = mutation({
    args: {
        reviewId: v.id("reviews"),
    },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        const review = await ctx.db.get(args.reviewId);

        if (!review) {
            throw new Error("Review not found");
        }

        const existingVote = await ctx.db
            .query("reviewVotes")
            .withIndex("by_user_and_review", (q) =>
                q.eq("userId", user._id).eq("reviewId", args.reviewId)
            )
            .first();

        if (existingVote) {
            await ctx.db.delete(existingVote._id);
            await ctx.db.patch(args.reviewId, {
                helpfulCount: (review.helpfulCount ?? 0) - 1,
            });
            return false;
        } else {
            await ctx.db.insert("reviewVotes", {
                userId: user._id,
                reviewId: args.reviewId,
                createdAt: Date.now(),
            });
            await ctx.db.patch(args.reviewId, {
                helpfulCount: (review.helpfulCount ?? 0) + 1,
            });
            return true;
        }
    },
});

export const hasUserVotedReview = query({
    args: {
        reviewId: v.id("reviews"),
    },
    handler: async (ctx, args) => {
        try {
            const user = await getUser(ctx);
            const vote = await ctx.db
                .query("reviewVotes")
                .withIndex("by_user_and_review", q => q.eq("userId", user._id).eq("reviewId", args.reviewId))
                .first();
            return !!vote;
        } catch (error) {
            return false;
        }
    }
});