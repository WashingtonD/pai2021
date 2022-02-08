app.controller('HistoryCtrl', [ '$http', '$scope', 'common', function($http, $scope, common) {
    let ctrl = this

    ctrl.contracts = []
    ctrl.contract = {}
    ctrl.q = 'commited:true'
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

    ctrl.refreshData = function(){
            $http.get('/contract?_id=' + ctrl.q).then(
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