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
import type * as chat from "../chat.js";
import type * as files from "../files.js";
import type * as projects from "../projects.js";
import type * as socialConnections from "../socialConnections.js";
import type * as socialPosts from "../socialPosts.js";
import type * as terminal from "../terminal.js";
import type * as trash from "../trash.js";
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
  chat: typeof chat;
  files: typeof files;
  projects: typeof projects;
  socialConnections: typeof socialConnections;
  socialPosts: typeof socialPosts;
  terminal: typeof terminal;
  trash: typeof trash;
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
