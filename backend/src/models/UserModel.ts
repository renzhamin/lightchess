import { Sequelize,DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import db from "../config/Database";


class Users extends Model<InferAttributes<Users>, InferCreationAttributes<Users>> {
    declare id : CreationOptional<number>
    declare name : string
    declare username : string
    declare email : string
    declare password : string
    declare refresh_token : string
    declare role : number
//     declare createdAt : CreationOptional<Date>
//     declare updatedAt : CreationOptional<Date>
}


Users.init(
    {
        id : {
            type : DataTypes.INTEGER.UNSIGNED,
            autoIncrement : true,
            primaryKey : true
        },
        name:{
            type: DataTypes.STRING
        },
        username :{
            type : DataTypes.STRING
        },
        email:{
            type: DataTypes.STRING
        },
        password:{
            type: DataTypes.STRING
        },
        refresh_token:{
            type: DataTypes.TEXT
        },
        role : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },
//         createdAt: DataTypes.DATE,
//         updatedAt: DataTypes.DATE,
    }
    ,{
        sequelize : db,
        tableName : 'users'
    }
)


export default Users;
