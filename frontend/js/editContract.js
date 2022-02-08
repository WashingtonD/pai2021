app.controller('EditContractCtrl', [ '$http', '$uibModalInstance', 'options', function( $http, $uibModalInstance, options) {
    let ctrl = this

    ctrl.options = options
    ctrl.persons = []
    ctrl.projects = []
    ctrl.options.data.exectuier = null
    ctrl.options.data.project = null

    ctrl.submit = function(answer) { $uibModalInstance.close(answer) }
    ctrl.cancel = function() { $uibModalInstance.dismiss(null) }

    ctrl.options.data.date_start = new Date( ctrl.options.data.date_start)
    ctrl.options.data.date_end = new Date( ctrl.options.data.date_end)

    


    $http.get('/person').then(
        function(res){
            ctrl.persons = res.data
            ctrl.options.data.exectuier = ctrl.persons[0]._id
        },
        function(err) {}
    )

    $http.get('/project').then(
        function(res){
            ctrl.projects = res.data
            ctrl.options.data.project = ctrl.projects[0]._id
        },
        function(err) {}
    )


}])