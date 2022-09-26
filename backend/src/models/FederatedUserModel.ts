import { Sequelize,DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import db from "../config/Database";


class FUser extends Model<InferAttributes<FUser>, InferCreationAttributes<FUser>> {
    declare id : CreationOptional<number>
    declare provider : string
    declare subject : string
//     declare createdAt : CreationOptional<Date>
//     declare updatedAt : CreationOptional<Date>
}


FUser.init(
    {
        id : {
            type : DataTypes.INTEGER.UNSIGNED,
            primaryKey : true
        },
        provider:{
            type: DataTypes.STRING,
            unique : 'u1'
        },
        subject :{
            type : DataTypes.STRING,
            unique : 'u1'
        },
    }
    ,{
        sequelize : db,
        tableName : 'federated_credentials'
    }
)

FUser.sync()


export default FUser;
