import { Router } from "express";
import userRoutes from '../modules/users/routes/userRoutes.js'
import bookRoutes from "../modules/books/index.js";
import auth from "../modules/users/middlewares/auth.js"
// import {testValidator} from "../modules/users/controllers/userController.js"
const router = Router();

router.use('/user', userRoutes);
router.use('/books', bookRoutes);

// test middlewares
// router.get("/testAuth", auth.authVerify,  testValidator);
// router.use('/test', (req, res)=>{
//     console.log("Funciona!!!")
//     res.send({
//         message:"transmitiendo correctamente!!!"
//     })
// });

export default router;