import sequelize from "../config/database";
import Todo from "./Todo";
import Utilisateur from "./Utilisateur.model";

const syncDatabase = async () => {
    try {
        //alter: true Met à jour la structure automatiquement la structure de la base de données
        //à utiliser sans options pour utiliser les migrations en production.
        await sequelize.sync({ alter: true });
        console.log("Base de données synchronisée");
    } catch (error) {
        console.error("Erreur lors de la synchronisation :", error);
    }
};

export { syncDatabase, Utilisateur, Todo };