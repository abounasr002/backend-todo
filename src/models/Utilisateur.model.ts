import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// Définition des attributs d'un utilisateur
interface UtilisateurI {
    id?: number;
    nom: string;
    email: string;
    hashedPassword?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

class Utilisateur extends Model<UtilisateurI> implements UtilisateurI {
    public id!: number;
    public nom!: string;
    public email!: string;
    public hashedPassword!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Utilisateur.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        hashedPassword: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: "utilisateurs",
        timestamps: true, // Ajoute createdAt & updatedAt
    }
);

export default Utilisateur;
