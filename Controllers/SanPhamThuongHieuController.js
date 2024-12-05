app.controller("SanPhamThuongHieuController", function ($scope, $document, SanPhamService, $location, $routeParams,$interval) {
    // Gắn file CSS cho controller
    let link = angular.element('<link rel="stylesheet" href="css/DanhSachSanPham.css">');
    $document.find('head').append(link);

    // Xóa CSS khi view bị hủy
    $scope.$on('$destroy', function () {
        link.remove();
        if (autoReload) {
            $interval.cancel(autoReload); // Hủy interval khi thoát khỏi controller
        }
    });
    const idThuongHieu = $routeParams.id;
    // Khởi tạo danh sách sản phẩm
    $scope.filteredProduct = [];
    $scope.paginatedProduct = [];
    $scope.itemsPerPage = 12; // Số sản phẩm mỗi trang
    $scope.currentPage = 0;
    $scope.sanPhams = [];
    $scope.errorMessage = null;
    $scope.listThuocTinh = [];
    $scope.listThuongHieu = [];
    $scope.searchParams = {
        idThuongHieu: idThuongHieu, // Mã thương hiệu
        giaMin: null, // Giá thấp nhất
        giaMax: null, // Giá cao nhất
        tenThuocTinhs: [] // Các thuộc tính lọc
    };
    $scope.toggleChiTiet = function (chiTiet) {
        const index = $scope.searchParams.tenThuocTinhs.indexOf(chiTiet);
        if (index === -1) {
            // Nếu chưa có, thêm vào mảng
            $scope.searchParams.tenThuocTinhs.push(chiTiet);
        } else {
            // Nếu đã có, xóa khỏi mảng
            $scope.searchParams.tenThuocTinhs.splice(index, 1);
        }
    };

    // Hàm load dữ liệu từ API
    function loadSanPham() {
        SanPhamService.getSanPhamByThuongHieu(idThuongHieu)
            .then(function (data) {
                $scope.sanPhams = data;
                $scope.filteredProduct = data;
                $scope.paginateOrders();
                console.log("Danh sách sản phẩm đã được cập nhật tự động.");
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải sản phẩm:", error);
            });
    }
    function searchSanPhams() {
        const params = {
            idThuongHieu: $scope.searchParams.idThuongHieu,
            giaMin: $scope.searchParams.giaMin,
            giaMax: $scope.searchParams.giaMax,
            tenThuocTinhs: $scope.searchParams.tenThuocTinhs
        };SanPhamService.searchSanPham(params)
            .then(function (data) {
                $scope.sanPhams = data;
                $scope.filteredProduct = data;
                $scope.paginateOrders();
                if (data.length === 0) {
                    $scope.errorMessage = "Không tìm thấy sản phẩm phù hợp.";
                } else {
                    $scope.errorMessage = null; // Xóa thông báo lỗi nếu có dữ liệu
                }
    
                console.log("Danh sách sản phẩm đã được cập nhật sau khi tìm kiếm.");
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            });
    }
    $scope.applyFilters = function() {
        searchSanPhams();
    };
   
    function LoadThuocTinh() {
        SanPhamService.getThuocTinhAll()
            .then(function (data) {
                // Dữ liệu ban đầu
                console.log("Thuộc tính trước khi gộp:", data);
    
                // Gộp thuộc tính
                $scope.groupedThuocTinhs = groupThuocTinhs(data);
    
                // Kiểm tra kết quả
                console.log("Thuộc tính sau khi gộp:", $scope.groupedThuocTinhs);
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải danh sách thuộc tính. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải thuộc tính:", error);
            });
    }
    LoadThuocTinh();
    function groupThuocTinhs(thuocTinhs) {
        const grouped = {};
    
        thuocTinhs.forEach(thuocTinh => {
            // Kiểm tra nếu thuộc tính chưa được thêm vào grouped
            if (!grouped[thuocTinh.nameThuocTinh]) {
                grouped[thuocTinh.nameThuocTinh] = [];
            }
    
            // Duyệt qua các chi tiết thuộc tính và thêm vào grouped nếu chưa có
            thuocTinh.thuocTinhChiTietViewModels.forEach(chitiet => {
                if (!grouped[thuocTinh.nameThuocTinh].includes(chitiet.tenThucTinhChiTiet)) {
                    grouped[thuocTinh.nameThuocTinh].push(chitiet.tenThucTinhChiTiet);
                }
            });
        });
    
        // Chuyển từ object sang mảng để dễ hiển thị
        return Object.keys(grouped).map(key => ({
            nameThuocTinh: key,
            chiTiet: grouped[key]
        }));
    }
    // Hàm phân trang
    $scope.paginateOrders = function () {
        $scope.paginatedProduct = [];
        for (let i = 0; i < $scope.filteredProduct.length; i += $scope.itemsPerPage) {
            $scope.paginatedProduct.push($scope.filteredProduct.slice(i, i + $scope.itemsPerPage));
        }
        $scope.currentPage = 0; // Reset về trang đầu tiên
    };

    $scope.goToPage = function (page) {
        if (page >= 0 && page < $scope.paginatedProduct.length) {
            $scope.currentPage = page;
        }
    };

    $scope.xemChiTiet = function (id) {
        console.log("Xem chi tiết sản phẩm:", id);
        $location.path(`/sanphamchitiet/${id}`);
    };

    // Tự động tải lại danh sách sản phẩm mỗi 10 giây
    const autoReload = $interval(function () {
        loadSanPham();
    }, 60000); // 10000 ms = 10 giây

    // Gọi hàm load dữ liệu ban đầu
    loadSanPham();

});




