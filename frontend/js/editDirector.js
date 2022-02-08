app.controller('EditDirectorCtrl', [ '$http', '$uibModalInstance', 'options', function( $http, $uibModalInstance, options) {
    let ctrl = this
    
    
        ctrl.options = options
        ctrl.users = []
        ctrl.options.data.director = null
    
        ctrl.submit = function(answer) { $uibModalInstance.close(answer) }
        ctrl.cancel = function() { $uibModalInstance.dismiss(null) }
    
    
        $http.get('/users?_role=director').then(
            function(res){
                ctrl.users = res.data
                ctrl.options.data.director = ctrl.users[0]._id
            },
            function(err) {}
        )
    }])