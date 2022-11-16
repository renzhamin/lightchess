# Rest api

| endpoint /api/X               | Method | Required Data                        | Response                                                |
| ----------------------------- | ------ | ------------------------------------ | ------------------------------------------------------- |
| /login                        | POST   | email,password                       | { accessToken } or failure                              |
| /token                        | GET    | cookie with refreshToken             | { accessToken } or failure                              |
| /register                     | POST   | email,username,password,confPassword | Verification email will be sent and success/failure msg |
| /resetpassword                | POST   | email                                | reset link will be sent to email                        |
| /send_email_verification_link | POST   | email                                | verification link will be sent to email and { msg }     |
| /users                        | GET    | -                                    | List of registered users                                |
| /user/:username               | GET    | -                                    | User stats                                              |
| /user/:username/recents/:n    | GET    | -                                    | Get Last n match results of a user                      |

# WebSocket

| Event Name | Argument                                                    | Handler                                             |
| ---------- | ----------------------------------------------------------- | --------------------------------------------------- |
| username   | username                                                    | name will be added to active users                  |
| getusers   | "oneDummyArgument "                                         | [ key : id, value : { name } ] for all active users |
| message    | to:receivers socket id (get it from getusers) and data:json | data will be delivered to receiver                  |
