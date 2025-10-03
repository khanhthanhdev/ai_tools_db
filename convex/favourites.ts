import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";
import { Doc, Id } from "./_generated/dataModel";

export const toggleFavourite = mutation({
  args: {
    toolId: v.id("aiTools"),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);

    const existingFavourite = await ctx.db
      .query("favourites")
      .withIndex("by_user_and_tool", (q) =>
        q.eq("userId", user._id).eq("toolId", args.toolId)
      )
      .first();

    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }

    if (existingFavourite) {
      await ctx.db.delete(existingFavourite._id);
      await ctx.db.patch(args.toolId, {
        totalFavourites: (tool.totalFavourites ?? 0) - 1,
      });
      return false;
    } else {
      await ctx.db.insert("favourites", {
        userId: user._id,
        toolId: args.toolId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.toolId, {
        totalFavourites: (tool.totalFavourites ?? 0) + 1,
      });
      return true;
    }
  },
});

export const isFavourited = query({
  args: {
    toolId: v.id("aiTools"),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getUser(ctx);

      const favourite = await ctx.db
        .query("favourites")
        .withIndex("by_user_and_tool", (q) =>
          q.eq("userId", user._id).eq("toolId", args.toolId)
        )
        .first();

      return !!favourite;
    } catch (error) {
      return false;
    }
  },
});

export const getUserFavourites = query({
  handler: async (ctx): Promise<Doc<"aiTools">[]> => {
    try {
      const user = await getUser(ctx);
      const favourites = await ctx.db
        .query("favourites")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const toolIds = favourites.map((f) => f.toolId);
      const tools = await Promise.all(
        toolIds.map((toolId) => ctx.db.get(toolId))
      );
      return tools.filter((tool): tool is Doc<"aiTools"> => tool !== null);
    } catch (error) {
      return [];
    }
  },
});