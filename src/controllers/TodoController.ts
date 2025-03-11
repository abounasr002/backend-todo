import { Request, Response } from "express";
import Todo from "../models/Todo";
import { JwtPayload } from "jsonwebtoken";

export async function createTodo(req: Request, res: Response) {
    try {
        const payload: JwtPayload = JSON.parse(req.headers.payload as string);
        const userId = payload.id
        const { task } = req.body;

        //Validation des champs
        if (!task) {
            res.status(400).send({ message: "champs task requis" })
            return
        }

        const updatedTodo = await Todo.create({ task, userId });

        res.status(201).send(updatedTodo)
    }
    catch (err: any) {
        res.status(500).send({ message: err.message })
    }

}

export async function getAllTodos(req: Request, res: Response) {
    try {
        const todos = await Todo.findAll()

        res.status(200).send(todos);
    }
    catch (err: any) {
        res.status(500).send({ message: "err.message" })
    }
}

export async function modifyTodo(req: Request, res: Response) {
    try {
        const { id } = req.params; // Récupérer l'ID depuis les paramètres de la requête

        // Vérifier si la tâche existe
        const todo = await Todo.findByPk(id);
        if (!todo) {
            res.status(404).json({ message: "Todo non trouvée" });
            return
        }

        // Mise à jour du champ `completed` à `true`
        todo.completed = true;
        await todo.save();

        // Réponse réussie
        res.status(200).json({ message: 'Todo mise à jour avec succès', data: todo });

    } catch (err: any) {
        // Gestion des erreurs
        res.status(500).json({ message: 'Erreur interne', error: err.message });
    }

}

export async function getAllFalses(req: Request, res: Response) {
    try {
        // 🔍 Récupérer toutes les tâches avec `completed: false`
        const todos = await Todo.findAll({
            where: { completed: false }
        });

        res.status(200).json(todos);
    } catch (err: any) {
        console.error("Erreur lors de la récupération :", err);
        res.status(500).json({ message: err.message });
    }
}

export async function getAllFromUser(req: Request, res: Response) {
    try {
        // 🔍 Récupérer l'utilisateur à partir du token
        const payload: JwtPayload | null = req.headers.payload
            ? JSON.parse(req.headers.payload as string)
            : null;

        if (!payload || !payload.id) {
            res.status(400).json({ message: "Payload incorrect" });
            return
        }

        const userId = payload.id;

        // 🔍 Rechercher toutes les tâches de cet utilisateur
        const todos = await Todo.findAll({
            where: { userId }
        });

        res.status(200).json({ message: `Tâches de l'utilisateur ${userId}`, todos });
    } catch (error: any) {
        console.error("Erreur lors de la récupération :", error);
        res.status(500).json({ message: error.message });
    }
}