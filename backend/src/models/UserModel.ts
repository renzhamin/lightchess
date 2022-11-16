import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from "sequelize"
import db from "../config/Database"

class Users extends Model<
    InferAttributes<Users>,
    InferCreationAttributes<Users>
> {
    declare id: CreationOptional<number>
    declare username: CreationOptional<string>
    declare displayname: CreationOptional<string>
    declare email: string
    declare password: CreationOptional<string>
    declare refresh_token: CreationOptional<string>

    declare role: CreationOptional<number>
    declare elo: CreationOptional<number>
    declare elo_history: CreationOptional<string>
    declare totalPlayed: CreationOptional<number>
    declare wins: CreationOptional<number>
    declare losses: CreationOptional<number>
    declare draws: CreationOptional<number>
    declare winAsWhite: CreationOptional<number>
    declare winAsBlack: CreationOptional<number>
    declare loseAsWhite: CreationOptional<number>
    declare loseAsBlack: CreationOptional<number>
    declare drawAsWhite: CreationOptional<number>
    declare drawAsBlack: CreationOptional<number>
}

Users.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
        },
        displayname: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        refresh_token: {
            type: DataTypes.TEXT,
        },
        role: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        elo: {
            type: DataTypes.INTEGER,
            defaultValue: 1200,
        },

        elo_history: {
            type: DataTypes.TEXT,
            defaultValue: "1200",
        },

        winAsWhite: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        winAsBlack: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        loseAsWhite: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        loseAsBlack: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        drawAsWhite: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        drawAsBlack: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        wins: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        losses: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        draws: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalPlayed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize: db,
        tableName: "users",
    }
)

Users.sync()

export default Users
