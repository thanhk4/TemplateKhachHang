app.controller('trahangController', function ($scope, $http,$location,$routeParams) {
    $scope.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const idhdct = $routeParams.idhdct
    $http.get('https://localhost:7297/api/HoaDonChiTiet'+idhdct)
    .then(function(response){
        $scope.data = response.data
        console.log($scope.data)
    })
    .catch(function(error){
        console.log(error)
    })
});
