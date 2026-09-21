import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { checkUserExists } from "../middlewares/userMiddleware.js";

const router = Router();

// Listar todos os usuários
router.get("/", userController.getAllUsers);

// Buscar usuário por ID
router.get("/:userId", checkUserExists, userController.getUserById);

// Criar usuário
router.post("/", userController.createUser);

// Atualizar usuário
router.put("/:userId", checkUserExists, userController.updateUser);

// Remover usuário
router.delete("/:userId", checkUserExists, userController.deleteUser);

export default router;