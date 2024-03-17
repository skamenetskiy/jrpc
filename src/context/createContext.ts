import {Context} from "./Context.ts";

/**
 * @name createContext
 * @desc Create a new context.
 * @param request
 * @param info
 */
export function createContext(request: Request, info: Deno.ServeHandlerInfo): Context {
  return {
    request: () => request,
    info: () => info,
  };
}