const db = require('./db')
const lib = require('./lib')

const user = module.exports = {

    handle: function(env) {


        let _id, user, _role
        let q = env.urlParsed.query.q ? env.urlParsed.query : '' 
        

        const validate = function(user){
         let result = {login: user.login, roles: user.roles}
        return result.login && result.roles ? result : null
        }        



        const sendAllUsers = function(q = ''){
            if(q = ''){
            db.users.aggregate([
                {$project: {login: 1, roles: 1}},
                { 
                    $match: {  
                        $or: [{ login: { $regex: RegExp(q, 'i') } } ],
                    }
            
                }   
            ]).toArray(function(err, users){
                console.log(users)
                if(!err){
                 lib.sendJson(env.res, users)
                }
                else{
                  lib.sendError(env.res, 400, 'users.aggregate failed  ' + err)
                }
            })
        }
        else{
            db.users.aggregate([
                {$project: {login: 1, roles: 1}},
                { 
                    $match: {  
                        $or: [{ login: { $regex: RegExp(q, 'i') } } ],
                        roles: {'$in' : ['director']}
                    }
            
                }   
            ]).toArray(function(err, users){
                console.log(users)
                if(!err){
                 lib.sendJson(env.res, users)
                }
                else{
                  lib.sendError(env.res, 400, 'users.aggregate failed  ' + err)
                }
            })
        }
        }


        if(env.req.method == 'POST' || env.req.method == 'PUT'){
            user = validate(env.payload)
            if(!user){
                lib.sendError(env.res, 400, 'invalid payload')
                return
            }
        }


        const socketRefresh = function (user) {
            lib.broadcast({ user, operation: 'users'}, function(client) {
                if(client.session == env.session) return false // nie wysyłaj wiadomości do sprawcy
                let session = lib.sessions[client.session]
                return session && Array.isArray(session.roles) && (session.roles.includes('admin') || session.roles.includes('director'))
            })
        }





        switch(env.req.method){
            case 'GET':
                _role = env.urlParsed.query._role
                if(_role)
                {
                    q = _role;
                }
                    sendAllUsers(q)
             break
             case 'POST':
                db.users.insertOne(user, function(err, result){
                    if(!err){
                        sendAllUsers(q)
                    } else{
                        lib.sendError(env.res, 400, 'users.insertOne failed ')
                    }
                })
                break
            case 'DELETE':
                _id = db.ObjectId(env.urlParsed.query._id)
                if(_id){
                    db.users.findOneAndDelete({_id},function(err, result){
                        if(!err){
                            sendAllUsers(q)
                            socketRefresh(_id)
                        } else{
                            lib.sendError(env.res, 400, 'users.findOneAndDelete() failed')
                        }          
                    })
                }
                else{
                    lib.sendError(env.res, 400, 'broken _id for delete ' + env.urlParsed.query._id )
                }
                break

            case 'PUT':
               _id = db.ObjectId(env.payload._id)
               if(_id){
                   
                    db.users.findOneAndUpdate({_id}, {$set: user}, { returnOriginal: false}, function(err, result){
                        if(!err){
                            sendAllUsers(q)
                            socketRefresh(user)
                        }else{
                            lib.sendError(env.res, 400, 'users.findOneAndUpdate() failed ' + err)
                        }
                    })
               } else{
                   lib.sendError(env.res, 400, 'broken _id for update ' + env.urlParsed.query._id)
               }
               break
             default:
                lib.sendError(env.res, 405, 'method not implemented')
        }


    }
}
