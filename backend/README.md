# Rest api

| endpoint /api/X | Method | Required Data                    | Response                                                |
| --------------- | ------ | -------------------------------- | ------------------------------------------------------- |
| /login          | POST   | email,password                   | { accessToken } or failure                              |
| /token          | GET    | cookie with refreshToken         | { accessToken } or failure                              |
| /register       | POST   | email,name,password,confPassword | Verification email will be sent and success/failure msg |
| /resetpassword  | POST   | email                            | reset link will be sent to email                        |
| /users          | GET    | -                                | List of registered users                                |

# WebSocket

| Event Name | Argument                                                    | Handler                                             |
| ---------- | ----------------------------------------------------------- | --------------------------------------------------- |
| name       | name                                                        | name will be added to active users                  |
| getusers   | "oneDummyArgument "                                         | [ key : id, value : { name } ] for all active users |
| message    | to:receivers socket id (get it from getusers) and data:json | data will be delivered to receiver                  |
