import {createContext} from "../context/createContext.ts";
import {App, methodDef} from "./App.ts";

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