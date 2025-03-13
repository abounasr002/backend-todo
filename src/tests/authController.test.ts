import { login, register } from "../controllers/AuthController";
import Utilisateur from "../models/Utilisateur.model"; // ✅ Vérifie que le chemin est correct
import { hashPassword, verifyPassword } from "../utils/pwdUtils";
import { generateToken } from "../utils/JWTUtils";

//Arrange: préparer l'environnement de test
//  Mock des dépendances
jest.mock("../utils/pwdUtils", () => ({
    verifyPassword: jest.fn(),
    hashPassword: jest.fn()
}));

jest.mock("../utils/JWTUtils", () => ({
    generateToken: jest.fn()
}));

jest.mock("../models/Utilisateur.model", () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));


// Création d'un mock propre de Sequelize
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

//describe décris une série de tests qui testent la même fonction
describe("login function", () => {
    let req: any;
    let res: any;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let cookieMock: jest.Mock;

    //beforeEach décris une série d'actions à faire avant chaque test. 
    // Ici ré-initialiser les mocks pour que les tests n'interfèrent pas entre eux.
    beforeEach(() => {
        //Ces mocks servent à simuler les requêtes et réponses HTTP:
        //mock res.status
        statusMock = jest.fn().mockReturnThis();
        //mock res.json() (contenu du body)
        jsonMock = jest.fn();
        //mock res.headers.cookie: les cookies contenus dans la réponse
        cookieMock = jest.fn();

        req = { body: {} };
        res = { status: statusMock, json: jsonMock, cookie: cookieMock };

        jest.clearAllMocks();
    });
    //fin arrange

    //Act
    //it sert à définir un test unitaire. Un cas est décris par une courte description, ensuite
    // on vérifie que le comportement est bien celui attendu.
    it("devrait retourner une erreur 404 si l'utilisateur n'existe pas", async () => {

        //simulation d'une requête entrante avec des données de connection
        req.body = { email: "test@example.com", password: "password" };

        // Mock de `findOne` sans toucher à Sequelize ni à la BDD
        // On simule un appel à la BDD via la fonction findOne du modèle sequelize
        // et on force une valeur de retour pour le test: ici null
        (Utilisateur.findOne as jest.Mock).mockResolvedValue(null);

        //Jest appelle la fonction login() avec les requête et réponse mockées :
        // Utilisateur.findOne({ where: { email: req.body.email } }) est appelé. 
        // findOne retourne null grâce au mock (Utilisateur.findOne as jest.Mock).mockResolvedValue(null);
        //login doit envoyer une réponse avec une erreur 404 et le message "Utilisateur non trouvé" 
        await login(req, res);

        //Assert
        //On capte la réponse http générée, on vérifie son statut et son contenu
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
    });

    //début d'un nouveau test
    //act
    it("devrait retourner une erreur 401 si le mot de passe est incorrect", async () => {

        //simulation d'une requête entrante avec des données de connection
        req.body = { email: "test@example.com", password: "wrongpassword" };

        //Le mock de l'utilisateur.findOne simule le fait que l'on ait retrouvé l'utilisateur test@example.com
        (Utilisateur.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            email: "test@example.com",
            hashedPassword: "hashedPwd"
        });

        //On simule que verifyPassword renvoie une valeure fausse
        (verifyPassword as jest.Mock).mockReturnValue(false);

        //login renvoie une réponse à partir des données mockées.
        await login(req, res);

        //assert
        //on vérifie le statut et le contenu de la réponse
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Mot de passe invalide" });
    });

    //act
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

        //assert
        expect(cookieMock).toHaveBeenCalledWith("jwt", "mocked-jwt-token", expect.any(Object));
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Login réussi !" });
    });

});


describe("register function", () => {
    let req: any;
    let res: any;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();

        req = { body: {} };
        res = { status: statusMock, json: jsonMock };

        jest.clearAllMocks();
    });

    // Test 1 : Retourne une erreur si les champs sont manquants
    it("devrait retourner une erreur 400 si des champs sont manquants", async () => {
        req.body = { email: "test@example.com" }; // Manque `nom` et `password`

        await register(req, res);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Les champs nom, email et password sont obligatoires."
        });
    });

    // Test 2 : Retourne une erreur si l'email ou le nom existe déjà
    it("devrait retourner une erreur 400 si l'email ou le nom existe déjà", async () => {
        req.body = { nom: "Test User", email: "test@example.com", password: "password123" };

        // Simule une contrainte d'unicité de Sequelize
        (Utilisateur.create as jest.Mock).mockRejectedValue({ name: "SequelizeUniqueConstraintError" });

        await register(req, res);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Email ou nom déjà existant." });
    });

    // Test 3 : Inscription réussie
    it("devrait enregistrer un nouvel utilisateur et retourner 201", async () => {
        req.body = { nom: "Test User", email: "test@example.com", password: "password123" };

        (hashPassword as jest.Mock).mockResolvedValue("hashed-password");
        (Utilisateur.create as jest.Mock).mockResolvedValue({
            id: 1,
            nom: "Test User",
            email: "test@example.com",
            hashedPassword: "hashed-password",
            get: function () {
                return { id: this.id, nom: this.nom, email: this.email };
            }
        });

        await register(req, res);

        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith({
            message: "Utilisateur créé avec succès",
            user: { id: 1, nom: "Test User", email: "test@example.com" }
        });
    });
});
