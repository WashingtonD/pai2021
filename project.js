const db = require('./db')
const lib = require('./lib')

const project = module.exports = {

    handle: function(env){

        const validate = function(project){
         let result = {name: project.name, director: project.director}
        return result.name && result.director ? result : null
        }        

        let _id, project
        let q = env.urlParsed.query.q ? env.urlParsed.query.q: ''
        let skip = env.urlParsed.query.skip ? parseInt(env.urlParsed.query.skip) : 0
        skip = isNaN(skip) || skip < 0 ? 0 : skip
        let limit = env.urlParsed.query.limit ? parseInt(env.urlParsed.query.limit) : 0
        limit = isNaN(limit) || limit <= 0 ? 999999 : limit


        const sendAllProjects = function(q = ''){
            db.projects.
            aggregate([
                { 
                    $match: {  
                        $or: [{ name: { $regex: RegExp(q, 'i') } } ],
                    }
            
                }
            ]).toArray(function(err, projects){
                if(!err){   
                    //console.log(projects)
                    lib.sendJson(env.res, projects)
                } else {
                    lib.sendError(env.res, 400,'projects.aggregate() failed ' + err)
                }
            })
        }

        if(env.req.method == 'POST' || env.req.method == 'PUT'){
            project = validate(env.payload)
            if(!project){
                lib.sendError(env.res, 400, 'invalid payload')
                return
            }
        }

        const socketRefresh = function (project) {
            lib.broadcast({ project, operation: 'project'}, function(client) {
                if(client.session == env.session) return false
                let session = lib.sessions[client.session]
                return session && Array.isArray(session.roles) && session.roles.includes('admin')
            })
        }



        switch(env.req.method){
            case 'GET':
                _id = db.ObjectId(env.urlParsed.query._id)
                if(_id){
                    db.projects.findOne({_id}, function(err,result){
                        lib.sendJson(env.res,result)
                        
                    })
                }
                else{
                    sendAllProjects(q)
                }
                break
            case 'POST':
                db.projects.insertOne(project, function(err, result){
                    if(!err){
                        sendAllProjects(q)
                        socketRefresh(project)
                    } else{
                        lib.sendError(env.res, 400, 'projects.insertOne failed ')
                    }
                })
                break
            case 'DELETE':
                _id = db.ObjectId(env.urlParsed.query._id)
                if(_id){
                    db.projects.findOneAndDelete({_id},function(err, result){
                        if(!err){
                            sendAllProjects(q)
                            socketRefresh(_id)
                        } else{
                            lib.sendError(env.res, 400, 'persons.findOneAndDelete() failed')
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
                    db.projects.findOneAndUpdate({_id}, {$set: project}, { returnOriginal: false}, function(err, result){
                        if(!err){
                            sendAllProjects(q)
                            socketRefresh(project)
                        }else{
                            lib.sendError(env.res, 400, 'project.findOneAndUpdate() failed')
                        }
                    })
               } else{
                   lib.sendError(env.res, 400, 'broken _id for update ' + env.urlParsed.query._id)
               }
               break
            default:
                lib.sendError(env.res, 405, 'method is not implemented')
        }
    }
}
