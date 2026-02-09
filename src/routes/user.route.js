import {Router} from 'express';
import { getProfile, loginUser, logoutUser, registerUser, updateProfile, changePassword } from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
    registerUser
)
router.route('/login').post(
    loginUser
)
router.route('/logout').post(
    verifyJWT, logoutUser
)
router.route('/profile').get(
    verifyJWT, getProfile
)
router.route('/update-profile').put(
    verifyJWT, updateProfile
)
router.route('/change-password').post(
    verifyJWT, changePassword
)
export default router