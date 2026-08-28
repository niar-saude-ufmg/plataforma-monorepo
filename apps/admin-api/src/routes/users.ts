import { Router } from 'express';
import { UserController } from '../controllers/users-controller.js';

const router = Router();
const userController = new UserController();

router.post('/', (req, res) => userController.createUser(req, res));

export const usersRouter = router;
