import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  interface Router {
    get(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any): Router;
    post(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any): Router;
    put(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any): Router;
    delete(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any): Router;
    patch(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any): Router;
  }
}
