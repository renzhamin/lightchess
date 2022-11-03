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
    declare name: string
    declare username: CreationOptional<string>
    declare email: string
    declare password: CreationOptional<string>
    declare refresh_token: CreationOptional<string>
    declare role: number
    declare elo: number

    declare totalPlayed: number
    declare wins: number
    declare losses: number
    declare draws: number
    declare winAsWhite: number
    declare winAsBlack: number
    declare loseAsWhite: number
    declare loseAsBlack: number
    declare drawAsWhite: number
    declare drawAsBlack: number
}

Users.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
        },
        username: {
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

export default Users
