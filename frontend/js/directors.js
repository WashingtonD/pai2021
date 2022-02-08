app.controller('DirectorsCtrl', [ '$http', '$scope', 'common', function($http, $scope, common) {
    let ctrl = this

    ctrl.users = []
    ctrl.user = {}
    ctrl.q = ''

    $http.get('/users?_role=director').then(
        function(res) {
            ctrl.users = res.data
        },
        function(err) {}
    )


    ctrl.edit = function(index){
    Object.assign(ctrl.user,ctrl.users[index])
    let options = {
    title:  'Edytuj Kierownika',
    ok: true,
    delete: index >= 0,
    cancel: true,
    data: ctrl.user
}
common.dialog('editDirector.html', 'EditDirectorCtrl', options, function(answer){
    switch(answer){
        case 'ok':
                $http.put('/users', ctrl.user).then(
                    function(res){
                        ctrl.users = res.data
                        common.alert.show('Kierownik zmieniony')
                    },  
                    function(err) {}
                )
        break
    case 'delete':
        let options = {
            title: 'Usunąc Kierownika?',
            body: ctrl.users[index].login,
            ok: true,
            cancel: true
        }
        common.confirm(options, function(answer){
            if(answer == 'ok'){
                $http.delete('/users?_id=' + ctrl.users[index]._id).then(
                    function(res){
                        ctrl.users = res.data
                        common.alert.show('Kierownik został usunięty')    
                    },
                    function(err) {}
                )
            }
        })
     break
    }
    
    ctrl.refreshData = function() {
        $http.get('users?q=' + ctrl.q).then(
            function(res) { ctrl.users = res.data},
            function(err) {}
        )
   
   }
   ctrl.refreshData()
   
   $scope.$on('refresh', function(event, parameters){
       if(parameters.collection == 'users'){
           ctrl.refreshData()
       }
   })



})

}

}])