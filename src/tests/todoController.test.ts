import { createTodo, getAllTodos, modifyTodo, getAllFalses, getAllFromUser } from "../controllers/TodoController";
import Todo from "../models/Todo";
import { Request, Response } from "express";

// Mock des dépendances
jest.mock("../models/Todo", () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
}));

describe("Todo Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let sendMock: jest.Mock;

    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        sendMock = jest.fn();
        req = { body: {}, headers: {} };
        res = { status: statusMock, json: jsonMock, send: sendMock  };
        jest.clearAllMocks();
    });

    describe("createTodo", () => {
        it("devrait retourner une erreur 400 si task est manquant", async () => {
            req.headers = { payload: JSON.stringify({ id: 1 }) }; // Assurer un payload valide
            req.body = {}; // Champ `task` manquant
    
            await createTodo(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(sendMock).toHaveBeenCalledWith({ message: "champs task requis" }); // Utiliser sendMock au lieu de jsonMock
        });
    
        it("devrait créer une tâche et retourner 201", async () => {
            req.headers = { payload: JSON.stringify({ id: 1 }) }; // Correction : JSON.stringify pour correspondre à JSON.parse
            req.body = { task: "Nouvelle tâche" };
    
            (Todo.create as jest.Mock).mockResolvedValue({ id: 1, task: "Nouvelle tâche", userId: 1 });
    
            await createTodo(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(sendMock).toHaveBeenCalledWith({ id: 1, task: "Nouvelle tâche", userId: 1 }); // Utiliser sendMock
        });
    });


    describe("getAllTodos", () => {
        it("devrait récupérer toutes les tâches", async () => {
            const mockTodos = [{ id: 1, task: "Faire les courses" }];
            (Todo.findAll as jest.Mock).mockResolvedValue(mockTodos);
    
            await getAllTodos(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(sendMock).toHaveBeenCalledWith(mockTodos); // Utilisation de sendMock
        });
    });

    describe("modifyTodo", () => {
        it("devrait retourner une erreur 404 si la tâche n'existe pas", async () => {
            req.params = { id: "1" };
            (Todo.findByPk as jest.Mock).mockResolvedValue(null);
    
            await modifyTodo(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Todo non trouvée" });
        });
    
        it("devrait mettre à jour completed et retourner 200", async () => {
            const mockTodo = {
                id: 1,
                completed: false,
                save: jest.fn().mockResolvedValue(null), // Simule bien l'enregistrement en DB
            };
    
            (Todo.findByPk as jest.Mock).mockResolvedValue(mockTodo);
    
            req.params = { id: "1" }; // Ajout de l'ID dans les paramètres de la requête
    
            await modifyTodo(req as Request, res as Response);
    
            expect(mockTodo.save).toHaveBeenCalled(); // Vérifie que la fonction save a bien été appelée
            expect(mockTodo.completed).toBe(true); // Vérifie que completed est bien passé à true
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                message: "Todo mise à jour avec succès",
                data: mockTodo,
            });
        });
    });


    describe("getAllFalses", () => {
        it("devrait récupérer toutes les tâches avec completed: false", async () => {
            const mockTodos = [
                { id: 1, task: "Faire le ménage", completed: false },
                { id: 2, task: "Aller à la salle de sport", completed: false }
            ];
    
            (Todo.findAll as jest.Mock).mockResolvedValue(mockTodos);
    
            await getAllFalses(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(mockTodos);
        });
    
        it("devrait retourner une erreur 500 en cas d'échec", async () => {
            (Todo.findAll as jest.Mock).mockRejectedValue(new Error("Erreur DB"));
    
            await getAllFalses(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Erreur DB" });
        });
    });
    


    describe("getAllFromUser", () => {
        it("devrait retourner une erreur 400 si le payload est incorrect", async () => {
            req.headers = { payload: undefined }; // Assure que payload est bien défini
            await getAllFromUser(req as Request, res as Response);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Payload incorrect" });
        });

        it("devrait récupérer toutes les tâches d'un utilisateur", async () => {
            req.headers = { payload: JSON.stringify({ id: 1 }) }; // Simule un bon payload
            (Todo.findAll as jest.Mock).mockResolvedValue([{ id: 1, task: "Ma tâche", userId: 1 }]);

            await getAllFromUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ 
                message: "Tâches de l'utilisateur 1", 
                todos: [{ id: 1, task: "Ma tâche", userId: 1 }] 
            });
        });
    });
});