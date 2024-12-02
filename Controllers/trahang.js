app.controller('donhangcuabanController', function ($scope, $http,$location,$routeParams) {
    // Lấy thông tin người dùng từ localStorage
    $scope.userInfo = $routeParams.idhdct
    $scope.dataKH={}
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    $http.get('https://localhost:7297/api/Khachhang/'+$scope.userInfo.id)
    .then(function(response){
        $scope.dataKH= {
            id: response.id,
            ten: response.ten
        }
        console.log($scope.dataKH)
    })
    const dataTrahang= {
        tenkhachhang: $scope.dataKH.ten,
        idnv: null,
        idkh: $scope.dataKH.id,
        sotienhoan: 0,
        lydotrahang: "Chưa nhập",
        trangthai: 0,
        phuongthuchoantien: "Chưa nhập",
        ngaytrahangdukien: new Date.now(),
        ngaytrahangthucte: new Date.now(),
        chuthich: null
    }
    $http.post('https://localhost:7297/api/Trahang',dataTrahang)
    .then(function(response){
        $http.get('https://localhost:7297/api/Khachhang/'+$scope.userInfo.id)
        .then(function(response){
            $scope.dataKH= {
                id: response.id,
                ten: response.ten
            }
            console.log($scope.dataKH)
        })
    })
});
