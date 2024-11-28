app.controller("MuahangController", function ($scope, $http) {
  const apiUrl = "https://localhost:7297/api/Hoadon";

  $scope.currentStatus = "ALL"; // Giá trị mặc định là 'ALL'
  $scope.searchText = "";
  $scope.orders = []; // Mảng chứa tất cả các đơn hàng
  $scope.filteredOrders = []; // Mảng chứa đơn hàng đã lọc

  // Tạo các mảng cho các trạng thái khác nhau
  $scope.ordersByStatus = {
    ALL: [],
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  };

  // Hàm tải đơn hàng từ API
  $scope.loadOrders = function () {
    $http
      .get(apiUrl)
      .then(function (response) {
        $scope.orders = response.data;
        // Lọc đơn hàng theo trạng thái và lưu vào các mảng riêng biệt
        $scope.applyFilters();
      })
      .catch(function (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        alert("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      });
  };

  // Hàm lọc đơn hàng theo trạng thái
  $scope.filterByStatus = function (status) {
    $scope.currentStatus = status;
    $scope.applyFilters(); // Lọc lại danh sách đơn hàng theo trạng thái đã chọn
  };

  // Hàm trả về text cho trạng thái
  $scope.getStatusText = function (status) {
    const statusMap = {
      0: "Chờ xác nhận",
      1: "Đơn hàng đã xác nhận",
      2: "Đơn hàng đã được giao",
      3: "Đơn hàng thành công",
      4: "Đơn hàng đã huỷ",
      5: "Trả hàng",
    };
    return statusMap[status] || "Không xác định";
  };

  // Hàm áp dụng các bộ lọc
  $scope.applyFilters = function () {
    // Làm trống các mảng trạng thái trước khi thêm lại
    Object.keys($scope.ordersByStatus).forEach(function (status) {
      $scope.ordersByStatus[status] = [];
    });

    // Chia các đơn hàng theo trạng thái
    $scope.orders.forEach(function (order) {
      $scope.ordersByStatus[order.status].push(order);
    });

    // Cập nhật lại filteredOrders để hiển thị theo trạng thái đã chọn
    if ($scope.currentStatus === "ALL") {
      $scope.filteredOrders = $scope.orders; // Hiển thị tất cả đơn hàng
    } else {
      $scope.filteredOrders = $scope.ordersByStatus[$scope.currentStatus]; // Hiển thị đơn hàng theo trạng thái
    }
  };

  // Initialize
  $scope.loadOrders();

  // Watch for search text changes
  $scope.$watch("searchText", function () {
    $scope.applyFilters(); // Khi tìm kiếm thay đổi, lọc lại đơn hàng
  });
});
