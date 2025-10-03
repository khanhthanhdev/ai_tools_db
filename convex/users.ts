import { query, MutationCtx, QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUser = async (ctx: QueryCtx | MutationCtx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
        throw new Error("User not authenticated");
    }
    const user = await ctx.db
        .query("users")
        .withIndex("by_id", (q) => q.eq("_id", userId))
        .first();

    if (!user) {
        throw new Error("User not found");
    }
    return user;
}