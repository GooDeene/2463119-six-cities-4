import { Route } from '../types/route.interface.js';
import { Response, Router } from 'express';

export interface Controller {
  readonly router: Router;

  addRoute(route: Route): void;
  created<T>(res: Response, data: T): void;
  noContent<T>(res: Response, data: T): void;
  ok<T>(res: Response, data: T): void;
  send<T>(res: Response, statusCode: number, data: T): void;
}
