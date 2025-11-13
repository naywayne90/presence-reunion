/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import { AnyDataModel } from "convex/server";
import type { GenericId } from "convex/values";

/**
 * The names of all of your Convex tables.
 */
export type TableNames = "messages" | "users";

/**
 * The type of a document stored in Convex.
 */
export type Doc<TableName extends TableNames> = TableName extends "messages"
  ? {
      _id: GenericId<"messages">;
      _creationTime: number;
      userId: GenericId<"users">;
      content: string;
      createdAt: number;
    }
  : TableName extends "users"
    ? {
        _id: GenericId<"users">;
        _creationTime: number;
        name: string;
        email: string;
        createdAt: number;
      }
    : never;

/**
 * An identifier for a document in Convex.
 *
 * Convex documents are uniquely identified by their `Id`, which is accessible
 * on the `_id` field. To learn more, see [Document IDs](https://docs.convex.dev/using/document-ids).
 *
 * Documents can be loaded using `db.get(id)` in query and mutation functions.
 *
 * **Important**: Use `myId.equals(otherId)` to check for equality. Using `===` will not work!
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Id<TableName extends TableNames | string> =
  GenericId<TableName>;

/**
 * A type describing your Convex data model.
 *
 * This type includes information about what tables you have, the type of
 * documents stored in those tables, and the indexes defined on them.
 *
 * This type is used to parameterize methods like `queryGeneric` and
 * `mutationGeneric` to make them type-safe.
 */
export type DataModel = {
  messages: {
    document: Doc<"messages">;
    fieldPaths:
      | "_id"
      | "_creationTime"
      | "userId"
      | "content"
      | "createdAt";
    indexes: { by_user: ["userId"] };
    searchIndexes: {};
    vectorIndexes: {};
  };
  users: {
    document: Doc<"users">;
    fieldPaths: "_id" | "_creationTime" | "name" | "email" | "createdAt";
    indexes: { by_email: ["email"] };
    searchIndexes: {};
    vectorIndexes: {};
  };
} & AnyDataModel;
