app.controller("SanPhamChiTietCtrl", function ($scope, $document, $rootScope, $routeParams, $location, SanPhamService) {
    let link = angular.element('<link rel="stylesheet" href="css/SanPhamChiTiet.css">');
    $document.find('head').append(link);

    $rootScope.$on('$destroy', function () {
        link.remove();
    });


    $scope.sanPham = null;
    $scope.errorMessage = null;
    $scope.selectedValues = {};
    $scope.sanPhams = [];
    $scope.selectedSPCTs = [];

    const sanPhamId = $routeParams.id;

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

    function loadSanPhamChiTiet() {
        SanPhamService.getSanPhamById(sanPhamId)
            .then(function (data) {
                $scope.sanPham = data;
                $scope.groupedThuocTinhs = groupThuocTinhs(data.sanphamchitiets.flatMap(sp => sp.thuocTinhs));
                console.log("Chi tiết sản phẩm:", $scope.sanPham);
                console.log("Nhóm thuộc tính:", $scope.groupedThuocTinhs);
                

                if ($scope.sanPham.idthuonghieu !== null) {
                    LoadSanPhamTuongTu($scope.sanPham.idThuongHieu);
                } else {
                    console.warn("Không tìm thấy idThuongHieu trong sản phẩm.");
                }
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải chi tiết sản phẩm:", error);
            });
    }

    function LoadSanPhamTuongTu(idThuongHieu) {
        if (!idThuongHieu) {
            console.warn("idThuongHieu không tồn tại.");
            return;
        }
        SanPhamService.getSanPhamByThuongHieu(idThuongHieu)
            .then(function (data) {
                $scope.sanPhams = randomizeProducts(data, 4);;
                console.log("Danh sách sản phẩm tương tự:", $scope.sanPhams);
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải sản phẩm tương tự:", error);
            });
    }
    function randomizeProducts(products, maxItems) {
        if (products.length > maxItems) {
            const shuffled = products.sort(() => 0.5 - Math.random()); 
            return shuffled.slice(0, maxItems); 
        }
        return products; 
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
    $scope.xemChiTiet = function (id) {
        console.log("Xem chi tiết sản phẩm:", id);
        $location.path(`/sanphamchitiet/${id}`);
    };
    loadSanPhamChiTiet();
    LoadDanhGia();

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

$scope.updateValidThuocTinhs = function () {
    const selectedThuocTinhs = Object.keys($scope.selectedValues).filter(key => $scope.selectedValues[key]);

    // Nếu không có thuộc tính nào được chọn, hiển thị tất cả thuộc tính hợp lệ
    if (selectedThuocTinhs.length === 0) {
        $scope.validThuocTinhs = angular.copy($scope.groupedThuocTinhs); // Mặc định tất cả các thuộc tính đều hợp lệ
        return;
    }

    // Tìm các sản phẩm chi tiết khớp với thuộc tính đã chọn
    const matchingSPCTs = $scope.sanPham.sanphamchitiets.filter(spct =>
        selectedThuocTinhs.every(selected =>
            spct.thuocTinhs.some(thuocTinh => thuocTinh.tenthuoctinhchitiet === selected)
        )
    );

    // Xác định các thuộc tính hợp lệ từ các sản phẩm chi tiết phù hợp
    const validThuocTinhs = {};
    matchingSPCTs.forEach(spct => {
        spct.thuocTinhs.forEach(thuocTinh => {
            if (!validThuocTinhs[thuocTinh.tenthuoctinh]) {
                validThuocTinhs[thuocTinh.tenthuoctinh] = new Set();
            }
            validThuocTinhs[thuocTinh.tenthuoctinh].add(thuocTinh.tenthuoctinhchitiet);
        });
    });

    // Chuyển đổi các giá trị từ Set sang Array để dễ sử dụng trên view
    $scope.validThuocTinhs = {};
    Object.keys(validThuocTinhs).forEach(key => {
        $scope.validThuocTinhs[key] = Array.from(validThuocTinhs[key]);
    });

    $scope.selectedSPCTs = matchingSPCTs;
    console.log("Các thuộc tính hợp lệ:", $scope.selectedSPCTs);
    
};


$scope.onThuocTinhChange = function () {
    // Lấy danh sách các thuộc tính đã chọn
    const selectedAttributes = Object.keys($scope.selectedValues).filter(key => $scope.selectedValues[key]);

    // Cập nhật danh sách thuộc tính hợp lệ
    $scope.updateValidThuocTinhs(); 
    
    // Cập nhật selectedSPCTs dựa trên thuộc tính đã chọn
    $scope.selectedSPCTs = getSelectedSPCTs(selectedAttributes); // Lấy SPCT từ các thuộc tính đã chọn
   // console.log("Các SPCT đã chọn:", $scope.selectedSPCTs);
};

// Hàm giả lập lấy các SPCT đã chọn
function getSelectedSPCTs(selectedAttributes) {
    return $scope.sanPham.sanphamchitiets.filter(spct => 
        selectedAttributes.every(attribute => 
            spct.thuocTinhs.some(thuocTinh => thuocTinh.tenthuoctinhchitiet === attribute)
        )
    );
}

$scope.isFormValid = true;  // Biến để kiểm tra tính hợp lệ của form

$scope.validateSelection = function () {
    // Kiểm tra tất cả các nhóm thuộc tính
    $scope.isFormValid = true;
    for (const key in $scope.groupedThuocTinhs) {
        const selected = Object.keys($scope.selectedValues).filter(value => $scope.selectedValues[value]);
        if (selected.length === 0) {
            $scope.isFormValid = false;
            break;
        }
    }
    // Kiểm tra và hiển thị thông báo lỗi
    if (!$scope.isFormValid) {
        $scope.errorMessage = "Vui lòng chọn tất cả các thuộc tính của sản phẩm.";
    } else {
        $scope.errorMessage = "";
    }
};


$scope.isDisabled = function (key, value) {
    // Nếu chưa có thuộc tính nào được chọn, không làm mờ
    if (Object.keys($scope.selectedValues).length === 0) {
        return false;
    }

    // Nếu thuộc tính chưa được chọn và không hợp lệ, làm mờ
    return !$scope.validThuocTinhs[key] || !$scope.validThuocTinhs[key].includes(value);
};
$scope.initialize = function () {
    // Nếu không có dữ liệu ban đầu, khởi tạo danh sách rỗng
    $scope.selectedSPCTs = $scope.selectedSPCTs || [];

    // Kiểm tra các điều kiện hợp lệ
    $scope.validateSelection();
};
$scope.initialize();


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
