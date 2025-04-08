import { Request, Response } from 'express';

export interface TypedRequest<T = any, U = any> extends Request {
  body: T;
  query: U;
}

export interface TypedResponse<T = any> extends Response {
  json: (body: T) => TypedResponse<T>;
}
