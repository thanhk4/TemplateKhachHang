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

    loadSanPhamChiTiet();

    const apIDSPCTUrl = "https://localhost:7297/api/Sanphamchitiet/GetSanPhamChiTietByThuocTinh";

    $scope.MuaSanPham = async function () {
        // Lấy danh sách các thuộc tính đã chọn
        const tenthuoctinhList = Object.keys($scope.selectedValues).filter(key => $scope.selectedValues[key]);

        // Kiểm tra xem có thuộc tính nào được chọn không
        if (tenthuoctinhList.length > 0) {
            try {
                // Chuyển mảng tenthuoctinhList thành chuỗi query string
                const queryString = tenthuoctinhList.map(item => `tenthuoctinh=${encodeURIComponent(item)}`).join('&');

                // Gọi API bằng phương thức fetch
                const response = await fetch(`${apIDSPCTUrl}?${queryString}`);

                // Kiểm tra xem API có trả về thành công không
                if (!response.ok) {
                    throw new Error('Lỗi khi gọi API');
                }

                // Chuyển dữ liệu từ response thành JSON
                const data = await response.json();

                // Xử lý dữ liệu trả về
                $scope.sanPhamChiTiets = data;
                console.log("Danh sách SPCT:", $scope.sanPhamChiTiets);

                // Kiểm tra dữ liệu trả về có thuộc tính idspct không null
                if (data.idspct != null) {
                    // Lấy ID của SPCT từ dữ liệu API
                    const firstSPCTId = data.idspct;
                    console.log(`Chuyển sang trang mua sản phẩm với id: ${firstSPCTId}`);

                    // Chuyển hướng tới trang chi tiết sản phẩm với id lấy được
                    $location.path(`/muasanpham/${firstSPCTId}`);
                } else {
                    console.log("Không có sản phẩm chi tiết nào phù hợp.");
                    $scope.errorMessage = "Không có sản phẩm chi tiết nào phù hợp với thuộc tính đã chọn.";
                }
            } catch (error) {
                $scope.errorMessage = "Không thể tải thông tin sản phẩm chi tiết. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải sản phẩm chi tiết:", error);
            }
        } else {
            console.log("Không có thuộc tính nào được chọn.");
            $scope.errorMessage = "Vui lòng chọn ít nhất một thuộc tính.";
        }
    };
});
