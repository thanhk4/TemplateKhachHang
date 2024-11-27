app.controller('MuahangController', function($scope) {
    $scope.activeTab = 'all';
    $scope.orders = [];

    $scope.tabs = [
        { id: "all", label: "Tất cả" },
        { id: "pending", label: "Chờ thanh toán" },
        { id: "shipping", label: "Vận chuyển" },
        { id: "delivering", label: "Chờ giao hàng" },
        { id: "completed", label: "Hoàn thành" },
        { id: "cancelled", label: "Đã hủy" },
        { id: "refunded", label: "Trả hàng/Hoàn tiền" },
    ];

    $scope.setActiveTab = function(tabId) {
        $scope.activeTab = tabId;
        // Thêm logic để lọc đơn hàng theo tab ở đây
    };

    // $scope.searchOrders = function() {
    //     // Thêm logic tìm kiếm đơn hàng ở đây
    // };

    // // Lấy danh sách đơn hàng từ API
  

    // // Lấy danh sách đơn hàng từ API
    // apiService.getOrders().then(function(response) {
    //     $scope.orders = response.data;
    // }, function(error) {
    //     console.error('Error fetching orders:', error);
    // });
   
});

