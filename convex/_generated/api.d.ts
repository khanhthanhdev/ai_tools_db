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
import type * as aiTools from "../aiTools.js";
import type * as auth from "../auth.js";
import type * as favourites from "../favourites.js";
import type * as http from "../http.js";
import type * as reviews from "../reviews.js";
import type * as router from "../router.js";
import type * as sampleData from "../sampleData.js";
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
  aiTools: typeof aiTools;
  auth: typeof auth;
  favourites: typeof favourites;
  http: typeof http;
  reviews: typeof reviews;
  router: typeof router;
  sampleData: typeof sampleData;
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
