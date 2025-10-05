/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions from "../actions.js";
import type * as aiTools from "../aiTools.js";
import type * as auth from "../auth.js";
import type * as cache from "../cache.js";
import type * as favourites from "../favourites.js";
import type * as http from "../http.js";
import type * as lib_cache from "../lib/cache.js";
import type * as lib_embeddingHelpers from "../lib/embeddingHelpers.js";
import type * as lib_gemini from "../lib/gemini.js";
import type * as reviews from "../reviews.js";
import type * as router from "../router.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  aiTools: typeof aiTools;
  auth: typeof auth;
  cache: typeof cache;
  favourites: typeof favourites;
  http: typeof http;
  "lib/cache": typeof lib_cache;
  "lib/embeddingHelpers": typeof lib_embeddingHelpers;
  "lib/gemini": typeof lib_gemini;
  reviews: typeof reviews;
  router: typeof router;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
