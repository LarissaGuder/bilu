import { Router } from 'express';
import { getAuth } from '../services/auth';

const routes = Router();

routes.get('/test', getAuth);

export default routes;
