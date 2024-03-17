/**
 * @name Context
 * @desc Describes request context.
 */
export interface Context {
  /**
   * @name request
   * @desc Returns request object.
   */
  request(): Request;

  /**
   * @name info
   * @desc Returns info object.
   */
  info(): Deno.ServeHandlerInfo;
}

/**
 * @name App
 * @desc Application interface.
 */
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

type methodDef = {
  [key: string]: (ctx: Context, reqBody: unknown) => Promise<unknown>;
}

/**
 * @name Handler
 * @desc Handler type definition.
 */
export type Handler<Request, Response> = (ctx: Context, req: Request) => Promise<Response>;

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


/**
 * @name createApp
 * @desc Create a new application.
 */
export function createApp(): App {
  const services = new Map<string, methodDef>();

  const handler = async (req: Request, info: Deno.ServeHandlerInfo): Promise<Response> => {
    if (req.method !== "POST") {
      return createResponse(405, {error: "method not allowed"});
    }
    const uri = new URL(req.url);
    const [serviceName, methodName] = uri.pathname.substring(1).split("/");
    if (serviceName === undefined || methodName === undefined) {
      return createResponse(400, {error: "bad request"});
    }
    const service = services.get(serviceName);
    if (service) {
      try {
        if (!(methodName in service)) {
          return createResponse(404, `unknown method ${methodName}`);
        }
        const result = await service[methodName](createContext(req, info), await req.json());
        return createResponse(200, result);
      } catch (err) {
        return createResponse(500, {error: err.message});
      }
    }
    return createResponse(404, {error: `unknown service ${serviceName}`});
  };

  const registerService = <Implementation>(name: string, service: Implementation) => {
    services.set(name, service as methodDef);
  };
  const serve = () => {
    Deno.serve({port: 3000}, handler);
  };

  return {
    registerService,
    serve,
  };
}

function createResponse(status: number, body: unknown, headers: { [key: string]: string } = {}): Response {
  const bodyBytes = JSON.stringify(body, null, 2);
  return new Response(bodyBytes, {
    status,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });
}