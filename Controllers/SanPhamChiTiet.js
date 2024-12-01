app.controller("SanPhamChiTietCtrl", function ($scope, $document, $rootScope, $routeParams, $location, SanPhamService) {
    let link = angular.element('<link rel="stylesheet" href="css/SanPhamChiTiet.css">');
    $document.find('head').append(link);

    $rootScope.$on('$destroy', function () {
        link.remove();
    });


    $scope.sanPham = null;
    $scope.errorMessage = null;
    $scope.selectedValues = {};  // Mảng lưu trạng thái các checkbox đã chọn

    function groupThuocTinhs(thuocTinhs) {
        const grouped = {};
        thuocTinhs.forEach(thuocTinh => {
            if (!grouped[thuocTinh.tenthuoctinh]) {
                grouped[thuocTinh.tenthuoctinh] = [];
            }
            if (!grouped[thuocTinh.tenthuoctinh].includes(thuocTinh.tenthuoctinhchitiet)) {
                grouped[thuocTinh.tenthuoctinh].push(thuocTinh.tenthuoctinhchitiet);
            }
        });
        return grouped;
    }

    const sanPhamId = $routeParams.id;

    function loadSanPhamChiTiet() {
        SanPhamService.getSanPhamById(sanPhamId)
            .then(function (data) {
                $scope.sanPham = data;
                $scope.groupedThuocTinhs = groupThuocTinhs(data.sanphamchitiets.flatMap(sp => sp.thuocTinhs));
                console.log("Chi tiết sản phẩm:", $scope.sanPham);
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải chi tiết sản phẩm:", error);
            });
    }
    function LoadDanhGia() {
        SanPhamService.getDanhGiaByIdSPCT(sanPhamId)
            .then(function (data) {
                $scope.danhGias = data;
                console.log("Danh sách đánh giá:", $scope.danhGias);
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải thông tin đánh giá. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải đánh giá:", error);
            });
    }
    LoadDanhGia();
    loadSanPhamChiTiet();

      // Đặt giá trị mặc định cho quantity
    $scope.quantity = parseInt(sessionStorage.getItem('quantity')) || 1; // Lấy số lượng từ sessionStorage nếu có
    $scope.maxQuantity = 100; // Giới hạn số lượng, có thể lấy từ dữ liệu sản phẩm

    // Hàm thay đổi số lượng
    $scope.changeQuantity = function (delta) {
        let newQuantity = $scope.quantity + delta;
        if (newQuantity >= 1 && newQuantity <= $scope.maxQuantity) {
            $scope.quantity = newQuantity;
            sessionStorage.setItem('quantity', $scope.quantity); // Lưu số lượng vào sessionStorage
        }
    };

    // Hàm lấy giá trị số lượng từ phần tử span (hiển thị)
    $scope.getQuantityDisplay = function() {
        const quantityDisplay = document.getElementById("quantity-display");
        if (quantityDisplay) {
            return quantityDisplay.innerText || quantityDisplay.textContent; // Lấy giá trị hiển thị
        }
        return null;
    };

    const apIDSPCTUrl = "https://localhost:7297/api/Sanphamchitiet/GetSanPhamChiTietByThuocTinh";
const apiIDSPtoIDSPCT = "https://localhost:7297/api/Sanphamchitiet/sanpham/";

$scope.MuaSanPham = async function () {
    // Lấy danh sách các thuộc tính đã chọn
    const tenthuoctinhList = Object.keys($scope.selectedValues).filter(key => $scope.selectedValues[key]);

    // Kiểm tra xem có thuộc tính nào được chọn không
    if (tenthuoctinhList.length > 0) {
        try {
            // Chuyển mảng tenthuoctinhList thành chuỗi query string
            const queryString = tenthuoctinhList.map(item => `tenthuoctinh=${encodeURIComponent(item)}`).join('&');

            // Gọi API để lấy danh sách SPCT theo thuộc tính
            const idspctTTResponse = await fetch(`${apIDSPCTUrl}?${queryString}`);
            if (!idspctTTResponse.ok) {
                throw new Error('Lỗi khi gọi API GetSanPhamChiTietByThuocTinh');
            }
            const dataspcttt = await idspctTTResponse.json();

            // Kiểm tra kết quả của API thuộc tính
            if (!dataspcttt || dataspcttt.length === 0) {
                $scope.errorMessage = "Không có sản phẩm chi tiết nào phù hợp với thuộc tính đã chọn.";
                console.log($scope.errorMessage);
                return;
            }

            // Gọi API để lấy danh sách SPCT theo sản phẩm
            const idspctSPResponse = await fetch(`${apiIDSPtoIDSPCT}${sanPhamId}`);
            if (!idspctSPResponse.ok) {
                throw new Error('Lỗi khi gọi API GetSanPhamChiTietBySanPham');
            }
            const dataspctsp = await idspctSPResponse.json();

            // Lọc ra các sản phẩm chi tiết trùng khớp giữa hai API
            const matchedSPCT = dataspcttt.filter(item => 
                dataspctsp.some(sp => sp.id === item.idspct)
            );

            if (matchedSPCT.length > 0) {
                // Xử lý sản phẩm chi tiết đầu tiên phù hợp
                const firstSPCTId = matchedSPCT[0].idspct;
                console.log(`Chuyển sang trang mua sản phẩm với id: ${firstSPCTId}`);
                $scope.$apply(() => {
                    $location.path(`/muasanpham/${firstSPCTId}`);
                });                
            } else {
                $scope.errorMessage = "Không có sản phẩm chi tiết nào phù hợp giữa hai API.";
                console.log($scope.errorMessage);
            }
        } catch (error) {
            $scope.errorMessage = "Không thể tải thông tin sản phẩm chi tiết. Vui lòng thử lại sau.";
            console.error("Lỗi khi tải sản phẩm chi tiết:", error);
        }
    } else {
        $scope.errorMessage = "Vui lòng chọn ít nhất một thuộc tính.";
        console.log($scope.errorMessage);
    }
};

});
