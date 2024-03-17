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

