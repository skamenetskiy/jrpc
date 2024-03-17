import type {Context} from "../context/Context.ts";

export interface App {
  /**
   * @name registerService
   * @desc Register a new service.
   * @param name Service name.
   * @param service Service implementation.
   */
  registerService<ServiceImplementation>(name: string, service: ServiceImplementation): void;

  /**
   * @name serve
   * @desc Start serving http connections.
   */
  serve(): void;
}

export type methodDef = {
  [key: string]: (ctx: Context, reqBody: unknown) => Promise<unknown>;
}