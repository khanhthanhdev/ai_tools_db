# Favourites & Reviews Implementation Plan
## AI Tool Database with Convex

---

## 📊 Overview

**Project:** Add Favourite and Review features to AI Tool Database  
**Backend:** Convex  
**Timeline:** 4-5 weeks  
**Features:**
- ⭐ Favourite/bookmark tools (heart icon on cards)
- ⭐ 5-star rating system with written reviews
- ⭐ Review voting ("helpful" feature)
- ⭐ User profile pages for favourites and reviews

---

## 🎯 Best Practices Summary

### Favourite Function
- **Icon:** Heart icon (outlined when not favourited, filled when favourited)
- **Position:** Top-right corner of tool card
- **Animation:** Subtle scale/pulse on click
- **Authentication:** Required before favouriting
- **Real-time:** Leverage Convex's reactive queries for instant updates
- **Social Proof:** Show favourite count on tool cards

### Review Function
- **Rating:** 5-star system (consider half-stars: use 1-10 scale internally)
- **One review per user per tool:** Users can edit their review
- **Review components:** Star rating (required) + text (optional, 50-500 chars)
- **Display:** Show aggregate rating + review count on cards
- **Sorting:** Most recent, most helpful, highest/lowest rating
- **Moderation:** Flag inappropriate reviews, admin review system
- **Verification:** Only authenticated users can review

---

## 📐 Phase 1: Database Schema (Week 1)

### Step 1.1: Update Convex Schema

Add these tables to your schema:

```typescript
// convex/schema.ts

// UPDATE existing aiTools table - add aggregate fields
aiTools: defineTable({
  // ... existing fields
  averageRating: v.optional(v.number()), // 0-5
  totalReviews: v.optional(v.number()),
  totalFavourites: v.optional(v.number()),
  ratingSum: v.optional(v.number()),
})
  // ... existing indexes
  .index("by_rating", ["averageRating"])
  .index("by_favourites", ["totalFavourites"])
  .index("by_isApproved", ["isApproved"])
  .index("by_submittedBy", ["submittedBy"])
  .index("by_language_and_isApproved", ["language", "isApproved"])
  .index("by_pricing_and_isApproved", ["pricing", "isApproved"])

// NEW: Favourites table
favourites: defineTable({
  userId: v.id("users"),
  toolId: v.id("aiTools"),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_tool", ["toolId"])
  .index("by_user_and_tool", ["userId", "toolId"])

// NEW: Reviews table
reviews: defineTable({
  userId: v.id("users"),
  toolId: v.id("aiTools"),
  rating: v.number(), // 1-10 for half-stars (2,4,6,8,10 = 1-5 stars)
  reviewText: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  helpfulCount: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_tool", ["toolId"])
  .index("by_user_and_tool", ["userId", "toolId"])
  .index("by_tool_and_created", ["toolId", "createdAt"])
  .index("by_tool_and_rating", ["toolId", "rating"])
  .index("by_tool_and_helpful", ["toolId", "helpfulCount"])

// NEW: Review votes table
reviewVotes: defineTable({
  userId: v.id("users"),
  reviewId: v.id("reviews"),
  createdAt: v.number(),
})
  .index("by_user_and_review", ["userId", "reviewId"])
  .index("by_review", ["reviewId"])
```

### Step 1.2: Migration Strategy

Since Convex handles migrations automatically:
1. Update schema file
2. Push to Convex: `npx convex dev`
3. Existing `aiTools` documents will have `undefined` for new fields
4. Handle `undefined` gracefully in queries (default to 0)

---

## 🔧 Phase 2: Backend - Favourites (Week 1-2)

### Step 2.1: Create Favourites Mutations

**File:** `convex/favourites.ts`

**Mutations needed:**
- `addFavourite(toolId)` - Add tool to user's favourites
- `removeFavourite(toolId)` - Remove tool from favourites
- `toggleFavourite(toolId)` - Toggle favourite state (convenience)

**Logic:**
1. Check authentication (`ctx.auth.getUserIdentity()`)
2. Verify tool exists
3. Check if already favourited (prevent duplicates)
4. Insert/delete favourite record
5. Recompute or atomically patch `totalFavourites` based on authoritative favourite count
6. Return success/error

### Step 2.2: Create Favourites Queries

**Queries needed:**
- `getUserFavourites()` - Get all favourites for current user
- `isFavourited(toolId)` - Check if specific tool is favourited
- `getFavouriteCount(toolId)` - Get total favourites for a tool

**Optimization:**
- Use Convex indexes for fast lookups
- Leverage reactive queries for real-time updates

---

## ⭐ Phase 3: Backend - Reviews (Week 2-3)

### Step 3.1: Create Review Mutations

**File:** `convex/reviews.ts`

**Mutations needed:**
- `createReview(toolId, rating, reviewText?)` - Submit new review
- `updateReview(reviewId, rating, reviewText?)` - Edit existing review
- `deleteReview(reviewId)` - Delete review
- `markReviewHelpful(reviewId)` - Vote review as helpful
- `unmarkReviewHelpful(reviewId)` - Remove helpful vote

**Logic for createReview:**
1. Authenticate user
2. Validate rating (1-10) and text (50-500 chars if provided)
3. Check if user already reviewed this tool (one review per user)
4. Insert review
5. Increment tool aggregates (`ratingSum`, `totalReviews`, `averageRating`)
6. Update `totalReviews` count
7. Return review ID

**Logic for updateReview:**
1. Verify user owns the review
2. Update rating and/or text
3. Update `updatedAt` timestamp
4. Adjust tool aggregates using the delta between old and new rating
5. Return success

**Logic for markReviewHelpful:**
1. Check if user already voted
2. Insert vote record
3. Increment `helpfulCount` on review (use atomic patch)
4. Return success

### Step 3.2: Create Review Queries

**Queries needed:**
- `getToolReviews(toolId, options?)` - Get paginated reviews for a tool
  - Options: sortBy (recent, helpful, rating), limit, offset
- `getUserReviews()` - Get all reviews by current user
- `getUserReview(toolId)` - Get current user's review for specific tool
- `getReviewStats(toolId)` - Get rating breakdown (how many 5⭐, 4⭐, etc.)
- `hasUserReviewedTool(toolId)` - Check if user reviewed tool
- `hasUserVotedReview(reviewId)` - Check if user voted review as helpful

### Step 3.3: Helper Function - Recalculate Rating

**File:** `convex/helpers.ts`

```typescript
export async function updateRatingAggregates(
  ctx,
  toolId: Id<"aiTools">,
  deltaRating: number,
  deltaCount: number
) {
  // Use ctx.db.patch with existing aggregate values (ratingSum, totalReviews, averageRating)
  // ratingSum += deltaRating
  // totalReviews += deltaCount
  // averageRating = totalReviews ? ratingSum / totalReviews : undefined
}
```

**Call this helper inside mutations with the appropriate delta:**
- Creating a review ➜ `deltaRating = rating`, `deltaCount = 1`
- Updating a review ➜ `deltaRating = newRating - oldRating`, `deltaCount = 0`
- Deleting a review ➜ `deltaRating = -rating`, `deltaCount = -1`

---

## 💻 Phase 4: Frontend - Favourites UI (Week 2-3)

### Step 4.1: Create Favourite Button Component

**Component:** `components/FavouriteButton.tsx`

**Features:**
- Heart icon (use `lucide-react` icons)
- Two states: outlined (not favourited) / filled (favourited)
- Loading state during mutation
- Tooltip on hover
- Click animation
- Handle authentication check
- Show login modal if not authenticated

**Convex Hooks:**
```typescript
const isFavourited = useQuery(api.favourites.isFavourited, { toolId });
const addFavourite = useMutation(api.favourites.addFavourite);
const removeFavourite = useMutation(api.favourites.removeFavourite);
```

### Step 4.2: Update Tool Card Component

**Add to tool card:**
- Favourite button in top-right corner
- Favourite count display (optional: "❤️ 24")
- Make it absolute positioned over card

### Step 4.3: Create "My Favourites" Page

**Route:** `/favourites` or `/dashboard/favourites`

**Features:**
- Grid/list of favourited tools
- Same tool card component as browse page
- Empty state with call-to-action
- Loading skeleton
- Remove favourite button on each card
- Filter/sort options

**Convex Hook:**
```typescript
const favourites = useQuery(api.favourites.getUserFavourites);
```

---

## ⭐ Phase 5: Frontend - Reviews UI (Week 3-4)

### Step 5.1: Create Star Rating Component

**Component:** `components/StarRating.tsx`

**Two modes:**
1. **Display mode:** Show rating (read-only)
2. **Input mode:** Allow user to select rating

**Features:**
- Interactive hover effects (input mode)
- Half-star support (optional)
- Customizable size
- Accessible (keyboard navigation)

### Step 5.2: Update Tool Card - Show Rating

**Add to tool card:**
- Average star rating (small stars)
- Review count (e.g., "4.5 ⭐ (127)")
- Make clickable to tool detail page

### Step 5.3: Create Review Form Component

**Component:** `components/ReviewForm.tsx`

**Features:**
- Star rating selector
- Textarea for review text
- Character counter (50-500 chars)
- Submit button (disabled until valid)
- Cancel button
- Loading state
- Error handling
- Success message

**Validation:**
- Rating: required, 1-5
- Text: optional, 50-500 chars if provided

**Convex Hooks:**
```typescript
const submitReview = useMutation(api.reviews.createReview);
const updateReview = useMutation(api.reviews.updateReview);
```

### Step 5.4: Create Reviews Section for Tool Detail Page

**Component:** `components/ReviewsSection.tsx`

**Layout:**
1. **Summary section** (top):
   - Large average rating
   - Total review count
   - Rating breakdown bar chart (5⭐: 80%, 4⭐: 15%, etc.)
   - "Write a review" button

2. **Review list:**
   - User avatar + name
   - Star rating
   - Review text
   - Date posted (relative: "2 days ago")
   - "Helpful" button with count
   - Edit/delete buttons (if user's own review)
   - Flag/report button

3. **Pagination/Load more**

**Filters & Sorting:**
- Sort by: Most Recent, Most Helpful, Highest Rating, Lowest Rating
- Filter by rating: All, 5⭐, 4⭐, 3⭐, 2⭐, 1⭐

**Convex Hooks:**
```typescript
const reviews = useQuery(api.reviews.getToolReviews, { 
  toolId, 
  sortBy: "recent",
  limit: 10,
  offset: 0 
});
const stats = useQuery(api.reviews.getReviewStats, { toolId });
```

### Step 5.5: Create Review Item Component

**Component:** `components/ReviewItem.tsx`

**Features:**
- Display all review data
- "Helpful" button (changes state when clicked)
- Edit mode (inline or modal)
- Delete confirmation
- Report modal
- Responsive layout

### Step 5.6: Add "My Reviews" to User Profile

**Route:** `/profile/reviews` or `/dashboard/reviews`

**Features:**
- List all user's reviews
- Quick link to each tool
- Edit/delete actions
- Empty state

---

## 🎨 Phase 6: Polish & Enhancements (Week 4-5)

### Step 6.1: Animations & Micro-interactions

**Add:**
- Heart fill animation (scale + color transition)
- Star rating hover effects
- Toast notifications for actions
- Skeleton loaders
- Smooth page transitions
- Review submission success animation

**Libraries:**
- `framer-motion` for animations
- `sonner` for toast notifications

### Step 6.2: Empty States

**Design beautiful empty states for:**
- No favourites yet
- No reviews yet
- No search results

**Include:**
- Illustration or icon
- Helpful message
- Call-to-action button

### Step 6.3: Real-time Updates

**Leverage Convex's reactive queries:**
- Favourite count updates instantly when others favourite
- New reviews appear automatically
- Rating updates in real-time
- No need for manual refetching!

### Step 6.4: Optimistic Updates

**For better UX:**
- Update UI immediately when favouriting (before mutation completes)
- Revert if mutation fails
- Show loading state briefly

**Convex pattern:**
```typescript
const { optimisticUpdate } = useOptimisticUpdate();
```

### Step 6.5: Error Handling

**Handle all error cases:**
- Network errors
- Authentication errors
- Validation errors
- Rate limiting errors

**Show user-friendly messages:**
- "Failed to add favourite. Please try again."
- "You must be logged in to review."
- "Review text must be between 50-500 characters."

---

## 🔒 Phase 7: Moderation & Security (Week 5)

### Step 7.1: Rate Limiting

**Implement in Convex mutations:**
- Max 5 reviews per hour per user
- Max 10 favourites per minute per user
- Track in temporary storage or database

**Pattern:**
```typescript
// Check recent actions count
// Throw error if limit exceeded
```

### Step 7.2: Content Moderation

**Review text validation:**
- Minimum 50 characters (if provided)
- Maximum 500 characters
- No URLs (optional rule)
- Profanity filter (optional - use library like `bad-words`)

**Report system:**
- Allow users to flag inappropriate reviews
- Admin dashboard to review flagged content
- Auto-hide reviews with multiple flags (threshold: 3-5)

### Step 7.3: Review Editing Rules

**Restrictions:**
- Allow editing within 24 hours of posting
- Show "edited" badge if review was edited
- Cannot change rating after 24 hours (only text)
- Log edit history (optional)

### Step 7.4: Anti-Spam Measures

**Prevent:**
- Multiple reviews from same user (database constraint)
- Review bombing (rate limiting)
- Fake reviews (require email verification)
- Bot reviews (add honeypot field or CAPTCHA)

---

## 📊 Phase 8: Analytics & Monitoring (Week 5)

### Step 8.1: Track Metrics

**Key metrics to track:**
- Total favourites per tool
- Total reviews per tool
- Average rating per tool
- Review submission rate
- Favourite/unfavourite rate
- Most favourited tools
- Highest rated tools
- Most reviewed tools

### Step 8.2: Admin Dashboard

**Create admin views:**
- Recent reviews (moderation queue)
- Flagged reviews
- Rating distribution across all tools
- User engagement stats
- Top contributors (most reviews)

### Step 8.3: Email Notifications (Optional)

**Send emails for:**
- New review on your submitted tool
- Reply to your review (if you add comments feature)
- Weekly digest of new reviews

---

## 🚀 Phase 9: Additional Features (Future)

### Nice-to-have features:

1. **Review Comments/Replies**
   - Allow tool owners to respond to reviews
   - Community discussion threads

2. **Review Photos**
   - Allow users to upload screenshots
   - Use Convex file storage

3. **Verified Reviews**
   - Badge for verified users
   - Special badge for tool creators/staff

4. **Review Templates**
   - Prompt users with questions
   - "What do you like? What could be improved?"

5. **Favourite Collections**
   - Create custom lists/folders
   - Share favourite collections

6. **Social Features**
   - Follow other users
   - See friends' favourites and reviews
   - Social activity feed

7. **Review Insights**
   - AI-generated summary of reviews
   - Sentiment analysis
   - Common themes/keywords

8. **Gamification**
   - Badges for reviewing X tools
   - Points for helpful reviews
   - Leaderboard

---

## ✅ Testing Checklist

### Favourites:
- [ ] Can add favourite when authenticated
- [ ] Cannot add favourite when not authenticated
- [ ] Cannot favourite same tool twice
- [ ] Can remove favourite
- [ ] Favourite count updates correctly
- [ ] My Favourites page shows all favourites
- [ ] Real-time updates work
- [ ] Icon state reflects favourite status

### Reviews:
- [ ] Can submit review with rating only
- [ ] Can submit review with rating + text
- [ ] Cannot submit review without rating
- [ ] Cannot review same tool twice
- [ ] Can edit own review
- [ ] Cannot edit others' reviews
- [ ] Can delete own review
- [ ] Average rating calculates correctly
- [ ] Review count updates correctly
- [ ] Can mark review as helpful
- [ ] Cannot mark same review helpful twice
- [ ] Helpful count updates correctly
- [ ] Review list pagination works
- [ ] Sorting options work
- [ ] Rating filter works

### Edge Cases:
- [ ] Deleting user removes their favourites/reviews
- [ ] Deleting tool removes associated favourites/reviews
- [ ] Concurrent favourites handled correctly
- [ ] Rate limiting works
- [ ] Character count validation works
- [ ] Empty states display correctly

---

## 📱 Mobile Optimization

### Considerations:
- Touch targets minimum 44x44px
- Bottom sheet for review forms
- Swipe gestures (optional)
- Responsive star rating component
- Simplified layout for mobile
- Fixed "Write Review" button on mobile

---

## 🎯 Success Metrics

**Track these KPIs:**
- % of users who favourite at least one tool
- Average favourites per user
- % of users who submit reviews
- Average review length
- Average rating across platform
- Time to first review
- Review engagement (helpful votes)

---

## 📚 Resources & References

### Convex Documentation:
- [Convex Indexes](https://docs.convex.dev/database/indexes)
- [Convex Authentication](https://docs.convex.dev/auth)
- [Convex Mutations](https://docs.convex.dev/functions/mutations)
- [Convex Queries](https://docs.convex.dev/functions/queries)
- [Convex Pagination](https://docs.convex.dev/database/pagination)

### UI Libraries:
- Lucide React (icons)
- Shadcn UI (components)
- Framer Motion (animations)
- Sonner (toasts)

### Validation:
- Zod (schema validation)

---

## 🎬 Conclusion

This plan provides a comprehensive roadmap for implementing favourites and reviews in your Convex-based AI tool database. The real-time capabilities of Convex will make these features feel snappy and modern.

**Next Steps:**
1. Review and approve this plan
2. Set up project timeline and milestones
3. Begin with Phase 1 (Schema updates)
4. Implement in order, testing thoroughly at each phase

**Estimated Total Time:** 4-5 weeks for full implementation

Good luck with your implementation! 🚀
