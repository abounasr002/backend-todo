import express from "express"
import { createTodo, getAllFalses, getAllFromUser, getAllTodos, modifyTodo } from "../controllers/TodoController";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware";

const router = express.Router()

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Créer une nouvelle tâche
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task
 *             properties:
 *               task:
 *                 type: string
 *                 example: "Apprendre swagger"
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *       400:
 *         description: Champs requis manquants
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/', verifyTokenMiddleware, createTodo)

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Récupérer toutes les tâches
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tâches
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/', verifyTokenMiddleware, getAllTodos)

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Passer le champs completed d'une tâche à true
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tâche à modifier
 *     responses:
 *       200:
 *         description: Tâche mise à jour avec succès
 *       400:
 *         description: ID requis
 *       404:
 *         description: Tâche non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */
router.put('/:id', verifyTokenMiddleware, modifyTodo)

/**
 * @swagger
 * /todos/false:
 *   get:
 *     summary: Récupérer toutes les tâches non complétées
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tâches non complétées
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/false', getAllFalses)

/**
 * @swagger
 * /todos/fromUser:
 *   get:
 *     summary: Récupérer les tâches d'un utilisateur spécifique
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tâches de l'utilisateur
 *       400:
 *         description: Payload incorrect
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/fromUser', verifyTokenMiddleware, getAllFromUser)

export default router;