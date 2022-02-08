app.controller('ContractsCtrl', [ '$http', '$scope', 'common', function($http, $scope, common) {
    let ctrl = this

    ctrl.contracts = []
    ctrl.contract = {}
    ctrl.q = ''
    ctrl.projects = []
    ctrl.persons = []

   $http.get('/person').then(
        function(res) {
            ctrl.persons = res.data
        },
        function(err) {}
    )

    
        $http.get('/project').then(
            function(res) {
                ctrl.projects = res.data
            },
            function(err) {}
        )  

    const contractDefaults = {
        id_execute: '',
        name: '',
        id_project: '',
        date_start: new Date(),
        date_end: new Date(),
        commited: false,
        date_of_commit: 0,
        reward: 0
    } 
 


    ctrl.edit = function(index){
        Object.assign(ctrl.contract, index >=0 ? ctrl.contracts[index] : contractDefaults)
        
        let options = {
            title: index >= 0 ? 'Edytuj Umowe' : 'Nowa Umowa',
            ok: true,
            delete: index >= 0,
            cancel: true,
            settle: index >= 0,
            data: ctrl.contract
        }



        common.dialog('editContract.html', 'EditContractCtrl', options, function(answer){
            switch(answer){
                case 'ok':
                    if(index >= 0){
                        $http.put('/contract', ctrl.contract).then(
                            function(res){
                                ctrl.contracts = res.data
                                common.alert.show('Umowa zmieniona')
                            },
                            function(err) {}
                        )
                    }
                    else{
                        delete ctrl.contract._id
                        $http.post('/contract',ctrl.contract).then(
                            function(res){
                                ctrl.contracts = res.data
                                common.alert.show('Umowa dodana')
                            },
                            function(err) {}
                        )
                    }
                    break
                    case 'delete':
                        let options = {
                            title: 'Usunąć umowę?',
                            body: ctrl.contracts[index].name,
                            ok: true,
                            cancel: true
                        }
                    common.confirm(options, function(answer){
                        if(answer =='ok'){
                            $http.delete('/contract?_id='+ctrl.contracts[index]._id).then(
                                function(res){
                                    ctrl.contracts = res.data
                                    common.alert.show('Umowa została usunięta')
                                },
                                function(err){}
                            )
                        }
                    })
                    break
                   case 'settle':
                    let  optionss = {
                           title: 'Rozliczyć umowę?',
                           body: ctrl.contracts[index].name,
                           ok: true,
                           cancel: true,
                           settle: true
                       }
                    common.confirm(optionss, function(answer){
                        if(answer =='ok'){
                            ctrl.contract.commited = true
                            ctrl.contract.date_of_commit = new Date().toISOString().toString()
                            $http.put('/contract', ctrl.contract).then(
                                function(res){
                                    ctrl.contracts = res.data   
                                    common.alert.show('Umowa została rozliczona ')
                                },
                                function(err) {}
                            )
                        }
                    })
                    break
            }
        })
    }

    ctrl.refreshData = function(){
        $http.get('/contract?q=' + ctrl.q).then(
            function(res) {ctrl.contracts = res.data},
            function(err) {}
        )
    }

ctrl.refreshData()

$scope.$on('refresh', function(event, parameters){
    if(parameters.collection == 'contracts')
    {
        ctrl.refreshData()
    }
})



}])