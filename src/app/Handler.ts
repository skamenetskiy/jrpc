import {Context} from "../context/Context.ts";

export type Handler<Request, Response> = (ctx: Context, req: Request) => Promise<Response>;