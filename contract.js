const db = require('./db')
const lib = require('./lib')


const contract = module.exports = {

    handle: function(env){

        const validate = function(contract){
            let result = {name: contract.name, id_execute: contract.id_execute, id_project: contract.id_project, date_start: contract.date_start, date_end: contract.date_end, reward: contract.reward, commited: contract.commited}
            return result.name && result.date_end && result.date_start && result.id_execute && result.id_project && !result.commited ? result : null
        }

        const validateNew = function(contract){
            let result = {name: contract.name, id_execute: contract.id_execute, id_project: contract.id_project, date_start: contract.date_start, date_end: contract.date_end, reward: contract.reward, commited: contract.commited, commitDate: contract.date_of_commit}
            return result.name && result.date_end && result.date_start && result.id_execute && result.id_project ? result : null
        }

        let _id, contract
        let q = env.urlParsed.query.q ? env.urlParsed.query.q : ''

        const sendAllContracts = function(q = ''){
            db.contracts.
            aggregate([
                { 
                    $match: {  
                        $or: [{ name: { $regex: RegExp(q, 'i') } }],
                        commited: false
                  }
            
                }
            ]).toArray(function(err, contracts){
                if(!err)
                {
                    lib.sendJson(env.res, contracts)
                }
                else{
                    lib.sendError(env.res, 400, 'contracts aggregation failed')
                }
            })
        }

        const sendAllCommitedContracts = function(q = ''){
            db.contracts.
            aggregate([
                { 
                    $match: {  
                        $or: [{ name: { $regex: RegExp(q, 'i') } }],
                        commited: true
                  }
            
                }
            ]).toArray(function(err, contracts){
                if(!err)
                {
                    lib.sendJson(env.res, contracts)
                }
                else{
                    lib.sendError(env.res, 400, 'contracts aggregation failed')
                }
            })
        }




        if(env.req.method == 'POST'){
            contract = validate(env.payload)
            if(!contract){
                lib.sendError(env.res, 400, 'Invalid payload!')
                return
            }
        }

        if(env.req.method == 'PUT'){
            contract = validateNew(env.payload)
            if(!contract){
                lib.sendError(env.res, 400, 'Invalid payload!')
                return
            }
        }

        const socketRefresh = function (contract) {
            lib.broadcast({ contract, operation: 'contract'}, function(client) {
                if(client.session == env.session) return false // nie wysyłaj wiadomości do sprawcy
                let session = lib.sessions[client.session]
                return session && Array.isArray(session.roles) && (session.roles.includes('admin') || session.roles.includes('director'))
            })
        }
    



        switch(env.req.method){
            case 'GET':
               _id = env.urlParsed.query._id
                
               if(_id == 'commited:true'){
                  
                 sendAllCommitedContracts(q)
                }
                else{
                    sendAllContracts(q)
                }
                break
            case 'POST':
                    db.contracts.insertOne(contract, function(err, result){
                        if(!err){
                            sendAllContracts(q)
                            socketRefresh(contract)
                        }
                        else{
                            lib.sendError(env.res, 400, 'contract InsertONE failed')
                        }
                    })
                    break
            case 'DELETE':
                _id = db.ObjectId(env.urlParsed.query._id)
                if(_id){
                    db.contracts.findOneAndDelete({_id}, function(err, result){
                        if(!err){
                            sendAllContracts(q)
                            socketRefresh(_id)
                        }else{
                            lib.sendError(env.res, 400, ' contracts findOneAndDelete failed')
                        }
                    })
                }
                else
                {
                    lib.sendError(env.res, 400, 'Broken contract _id for delete ' + env.urlParsed.query._id)
                }
                break
        
            case 'PUT':
                _id = db.ObjectId(env.payload._id)
                if(_id){
                    db.contracts.findOneAndUpdate({_id}, {$set: contract}, {returnOriginal: false}, function(err,result){
                        if(!err){
                            sendAllContracts(q)
                            socketRefresh(contract)
                        }else{
                            lib.sendError(env.res, 400, 'contracts.findOneAndUpdate() failed')
                        }
                    })
                }
                else{
                    lib.sendError(env.res,400, 'Broken _id for update' + env.urlParsed.query._id)
                }
                break
            default:
                lib.sendError(env.res, 405, 'method is not implemented yet')
                
        }



    }





}