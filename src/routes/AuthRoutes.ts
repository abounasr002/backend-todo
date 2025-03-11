import express from "express"
import { login, register } from "../controllers/AuthController";

const router = express.Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - email
 *               - password
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Alice"
 *               email:
 *                 type: string
 *                 example: "Alice@mail.com"
 *               password:
 *                 type: string
 *                 example: "pwd"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Champs obligatoires manquants ou utilisateur existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/register', register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "Alice@mail.com"
 *               password:
 *                 type: string
 *                 example: "pwd"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Champs obligatoires manquants
 *       401:
 *         description: Mot de passe invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', login)

export default router;