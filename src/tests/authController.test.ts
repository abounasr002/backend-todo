import { login } from "../controllers/AuthController";
import Utilisateur from "../models/Utilisateur.model"; // ✅ Vérifie que le chemin est correct
import { verifyPassword } from "../utils/pwdUtils";
import { generateToken } from "../utils/JWTUtils";

// ✅ Mock des dépendances
jest.mock("../utils/pwdUtils", () => ({
    verifyPassword: jest.fn()
}));

jest.mock("../utils/JWTUtils", () => ({
    generateToken: jest.fn()
}));

// ✅ Création d'un mock propre de Sequelize
jest.mock("sequelize", () => {
    const actualSequelize = jest.requireActual("sequelize");

    class MockModel {
        static init = jest.fn();
        static findOne = jest.fn();
    }

    return {
        Sequelize: jest.fn(() => ({
            define: jest.fn(),
            sync: jest.fn(),
            authenticate: jest.fn(),
            close: jest.fn()
        })),
        DataTypes: actualSequelize.DataTypes,
        Model: MockModel,
    };
});

jest.mock("../models/Utilisateur.model", () => ({
    findOne: jest.fn(),
}));

describe("login function", () => {
    let req: any;
    let res: any;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let cookieMock: jest.Mock;

    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        cookieMock = jest.fn();

        req = { body: {} };
        res = { status: statusMock, json: jsonMock, cookie: cookieMock };

        jest.clearAllMocks();
    });

    it("devrait retourner une erreur 404 si l'utilisateur n'existe pas", async () => {
        req.body = { email: "test@example.com", password: "password" };

        // ✅ Mock propre de `findOne` sans toucher à Sequelize
        (Utilisateur.findOne as jest.Mock).mockResolvedValue(null);

        await login(req, res);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
    });

    it("devrait retourner une erreur 401 si le mot de passe est incorrect", async () => {
        req.body = { email: "test@example.com", password: "wrongpassword" };

        (Utilisateur.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            email: "test@example.com",
            hashedPassword: "hashedPwd"
        });

        (verifyPassword as jest.Mock).mockReturnValue(false);

        await login(req, res);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Mot de passe invalide" });
    });

    it("devrait générer un token et enregistrer un cookie", async () => {
        req.body = { email: "test@example.com", password: "password" };

        (Utilisateur.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            email: "test@example.com",
            hashedPassword: "hashedPwd"
        });

        (verifyPassword as jest.Mock).mockReturnValue(true);
        (generateToken as jest.Mock).mockReturnValue("mocked-jwt-token");

        await login(req, res);

        expect(cookieMock).toHaveBeenCalledWith("jwt", "mocked-jwt-token", expect.any(Object));
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Login réussi !" });
    });

});
