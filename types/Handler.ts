import { Context } from "./Context.ts";

/**
 * @name Handler
 * @desc Handler type definition.
 */
export type Handler<Request, Response> = (ctx: Context, req: Request) => Promise<Response>;
