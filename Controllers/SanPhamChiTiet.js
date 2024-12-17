app.controller("SanPhamChiTietCtrl", function ($scope, $document, $rootScope, $routeParams, $location, SanPhamService, $timeout) {
    let link = angular.element('<link rel="stylesheet" href="css/SanPhamChiTiet.css">');
    $document.find('head').append(link);

    $rootScope.$on('$destroy', function () {
        link.remove();
    });

    sessionStorage.setItem('quantity', 1);
    $scope.sanPham = null;
    $scope.errorMessage = null;
    $scope.selectedValues = {};
    $scope.sanPhams = [];

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
                    LoadSanPhamTuongTu($scope.sanPham.idThuongHieu, $scope.sanPham.id);
                } else {
                    console.warn("Không tìm thấy idThuongHieu trong sản phẩm.");
                }
            })
            .catch(function (error) {
                $scope.errorMessage = "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải chi tiết sản phẩm:", error);
            });
    }

    function LoadSanPhamTuongTu(idThuongHieu, idSanPhamHienTai) {
        if (!idThuongHieu) {
            console.warn("idThuongHieu không tồn tại.");
            return;
        }
        SanPhamService.getSanPhamByThuongHieu(idThuongHieu)
            .then(function (data) {
                // Lọc bỏ sản phẩm hiện tại khỏi danh sách
                const filteredProducts = data.filter(function (product) {
                    return product.id !== idSanPhamHienTai; // Loại bỏ sản phẩm hiện tại
                });

                // Lấy danh sách sản phẩm tương tự ngẫu nhiên
                $scope.sanPhams = randomizeProducts(filteredProducts, 4);
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
        SanPhamService.getDanhGiaByIdSPCT(sanPhamId) // Gọi API lấy tất cả đánh giá
            .then(function (data) {
                $scope.danhGiasAll = data; // Lưu tất cả đánh giá vào mảng
                console.log("Danh sách đánh giá:", $scope.danhGiasAll);

                $scope.pageSize = 3; // Số đánh giá mỗi trang
                $scope.currentPage = 1; // Trang mặc định là trang 1

                // Lọc dữ liệu cho trang hiện tại
                $scope.paginateDanhGias();

                // Duyệt qua từng đánh giá và load thông tin khách hàng nếu có
                $scope.danhGiasAll.forEach(danhGia => {
                    if (danhGia.idkh) {
                        LoadKhachHangById(danhGia);
                    } else {
                        console.warn("ID khách hàng không hợp lệ:", danhGia);
                        danhGia.tenKhachHang = "Không xác định";
                    }
                });
            })
            .catch(function (error) {
                // Xử lý lỗi từ API
                if (error.status === 404) {
                    $scope.errorMessage = "Không tìm thấy đánh giá nào cho sản phẩm này.";
                    $scope.danhGiasAll = []; // Xóa dữ liệu khi không tìm thấy
                } else if (error.status === 400) {
                    $scope.errorMessage = error.data.message || "Yêu cầu không hợp lệ.";
                } else {
                    $scope.errorMessage = "Đã xảy ra lỗi không xác định.";
                }
            });
    }

    // Hàm phân trang
    $scope.paginateDanhGias = function () {
        // Tính toán vị trí bắt đầu và kết thúc của mảng cần hiển thị
        var start = ($scope.currentPage - 1) * $scope.pageSize;
        var end = start + $scope.pageSize;
        $scope.danhGias = $scope.danhGiasAll.slice(start, end); // Cắt mảng để hiển thị các đánh giá của trang hiện tại
    };

    // Chuyển trang
    $scope.goToPage = function (page) {
        if (page >= 1 && page <= $scope.totalPages()) {
            $scope.currentPage = page;
            $scope.paginateDanhGias(); // Lọc lại dữ liệu khi chuyển trang
        }
    };

    // Tính tổng số trang
    $scope.totalPages = function () {
        return Math.ceil($scope.danhGiasAll.length / $scope.pageSize);
    };


    function LoadKhachHangById(danhGia) {
        SanPhamService.getKhachHangById(danhGia.idkh)
            .then(function (data) {
                danhGia.tenKhachHang = data.ten;
                console.log("Thông tin khách hàng:", data);

            })
            .catch(function (error) {
                console.error("Lỗi khi gọi API:", error);
                danhGia.tenKhachHang = "Không xác định"; // Gán giá trị mặc định khi lỗi
            });
    }
    $scope.goToPage = function (page) {
        if (page >= 1 && page <= $scope.totalPages()) {
            $scope.currentPage = page; // Chuyển đến trang mới
            $scope.paginateDanhGias(); // Gọi hàm phân trang để cập nhật danh sách đánh giá
        }
    };

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
    $scope.getQuantityDisplay = function () {
        const quantityDisplay = document.getElementById("quantity-display");
        if (quantityDisplay) {
            return quantityDisplay.innerText || quantityDisplay.textContent; // Lấy giá trị hiển thị
        }
        return null;
    };

    // Hàm lấy thông tin khách hàng từ localStorage
    function GetByidKH() {
        // Lấy dữ liệu từ localStorage
        const userInfoString = localStorage.getItem("userInfo");
        let userId = 0; // Giá trị mặc định nếu không có thông tin khách hàng

        // Kiểm tra nếu dữ liệu tồn tại
        if (userInfoString) {
            try {
                // Chuyển đổi chuỗi JSON thành đối tượng
                const userInfo = JSON.parse(userInfoString);

                // Kiểm tra và lấy giá trị id từ userInfo
                userId = userInfo?.id || 0;
            } catch (error) {
                console.error("Lỗi khi phân tích dữ liệu userInfo:", error);
            }
        } else {
            console.warn("Dữ liệu userInfo không tồn tại trong localStorage.");
        }

        return userId;
    }

    // Hàm lấy id giỏ hàng
    async function fetchGioHangId(idkh) {
        try {
            const response = await fetch(`${gioHang}/${idkh}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi khi lấy id giỏ hàng:", error);
            return null;
        }
    }

    // Lưu địa chỉ mới api
    async function AddGHCT(idspct) {
        const idkh = await GetByidKH();
        const idgh = await fetchGioHangId(idkh);
        const soluong = $scope.quantity;

        const newGioHangCT = {
            id: 0,
            idgh: idgh.id,
            idspct: idspct,
            soluong: soluong
        };

        try {
            await axios.post(gioHangChiTiet, newGioHangCT);
            Swal.fire("Thành công", "Sản phẩm đã được thêm giỏ hàng.", "success");
            $scope.$apply(() => {
                $location.path(`/muasanpham/${firstSPCTId}`);
            });
        } catch (error) {
            Swal.fire("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng.", "error");
            console.error(error);
        }
    };

    const apIDSPCTUrl = "https://localhost:7297/api/Sanphamchitiet/GetSanPhamChiTietByThuocTinh";
    const apiIDSPtoIDSPCT = "https://localhost:7297/api/Sanphamchitiet/sanpham/"; ``
    const gioHang = "https://localhost:7297/api/Giohang/giohangkhachhang";
    const gioHangChiTiet = "https://localhost:7297/api/Giohangchitiet";

    $scope.timkhachHang = function (idkhachHang) {

    }

    $scope.GioHang = async function () {
        // Lấy danh sách các thuộc tính đã chọn
        const tenthuoctinhList = Object.keys($scope.selectedValues).filter(key => $scope.selectedValues[key]);


        if (!$scope.selectedSPCTs || $scope.selectedSPCTs[0].soluong === 0 && selectedSPCTs[0].sales[0].soluong <= 0) {
            console.log("Không thể mua sản phẩm do hết hàng.");
            console.log(selectedSPCTs[0].sales[0].soluong);

            return;
        }
        // Kiểm tra xem tất cả các thuộc tính có được chọn chưa
        if (tenthuoctinhList.length === Object.keys($scope.groupedThuocTinhs).length) {
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
                    const firstSPCTId = matchedSPCT[0].idspct;
                    AddGHCT(firstSPCTId)
                    $timeout(() => {
                        $scope.$apply(() => {
                            $location.path('/giohang'); // Chuyển hướng đến trang "Giỏ hàng"
                        });
                        $scope.isLoading = false; // Kết thúc tải (nếu cần)
                    }, 3000);
                } else {
                    $scope.errorMessage = "Không có sản phẩm chi tiết nào phù hợp giữa hai API.";
                    console.log($scope.errorMessage);
                }
            } catch (error) {
                $scope.errorMessage = "Không thể tải thông tin sản phẩm chi tiết. Vui lòng thử lại sau.";
                console.error("Lỗi khi tải sản phẩm chi tiết:", error);
            }
        } else {
            // Hiển thị thông báo nếu chưa chọn đủ tất cả các thuộc tính
            $scope.errorMessage = "Vui lòng chọn tất cả các thuộc tính của sản phẩm.";
            console.log($scope.errorMessage);
        }
    };


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

        console.log("Các sản phẩm chi tiết khớp:", matchingSPCTs);

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
        $scope.quantity = 1;
        // Lấy danh sách các thuộc tính đã chọn
        const selectedAttributes = Object.keys($scope.selectedValues).filter(key => $scope.selectedValues[key]);

        // Kiểm tra xem tất cả các thuộc tính đã được chọn chưa
        if (selectedAttributes.length === Object.keys($scope.groupedThuocTinhs).length) {
            // Nếu tất cả các thuộc tính đã được chọn, lọc sản phẩm chi tiết tương ứng
            $scope.selectedSPCTs = $scope.sanPham.sanphamchitiets.filter(spct =>
                selectedAttributes.every(attribute =>
                    spct.thuocTinhs.some(thuocTinh => thuocTinh.tenthuoctinhchitiet === attribute)
                )
            );
            $scope.errorMessage = ""; // Xóa thông báo lỗi
        } else {
            // Nếu chưa chọn đủ thuộc tính
            $scope.selectedSPCTs = [];
            $scope.errorMessage = "Vui lòng chọn tất cả các thuộc tính của sản phẩm.";
        }
        console.log("Các thuộc tính đã chọn:", selectedAttributes);
        console.log("Các sản phẩm chi tiết đã chọn:", $scope.selectedSPCTs);

    };


    $scope.isFormValid = true;  // Biến để kiểm tra tính hợp lệ của form


    $scope.validateSelection = function () {
        // Kiểm tra xem tất cả các thuộc tính có được chọn chưa
        const selectedAttributes = Object.keys($scope.selectedValues).filter(value => $scope.selectedValues[value]);
        if (selectedAttributes.length !== Object.keys($scope.groupedThuocTinhs).length) {
            $scope.isFormValid = false;
            $scope.errorMessage = "Vui lòng chọn tất cả các thuộc tính của sản phẩm.";
        } else {
            $scope.isFormValid = true;
            $scope.errorMessage = "";
        }
    };
    $scope.initialize = function () {

        $scope.quantity = 1;
        // Kiểm tra và khởi tạo nếu chưa có dữ liệu ban đầu
        $scope.selectedValues = $scope.selectedValues || {}; // Khởi tạo nếu chưa có
        $scope.groupedThuocTinhs = $scope.groupedThuocTinhs || {}; // Khởi tạo nếu chưa có
        console.log($scope.selectedValues, $scope.groupedThuocTinhs);

        // Kiểm tra các điều kiện hợp lệ
        $scope.validateSelection();
    };


    $scope.initialize();
    $scope.isDisabled = function (tenthuoctinh, tenthuoctinhchitiet) {
        // Nếu chưa có thuộc tính hợp lệ hoặc đã chọn tất cả các thuộc tính, không vô hiệu hóa bất kỳ giá trị nào
        if (!$scope.validThuocTinhs || Object.keys($scope.selectedValues).length === Object.keys($scope.groupedThuocTinhs).length) {
            return false;
        }

        // Kiểm tra xem thuộc tính cụ thể có nằm trong danh sách thuộc tính hợp lệ không
        const validValues = $scope.validThuocTinhs[tenthuoctinh];
        if (!validValues) {
            return true; // Không có giá trị hợp lệ cho thuộc tính này, vô hiệu hóa
        }

        // Nếu thuộc tính chi tiết không nằm trong danh sách hợp lệ, vô hiệu hóa
        return !validValues.includes(tenthuoctinhchitiet);
    };
    $scope.isDisabled = function (key, value) {
        const selectedAttributes = Object.keys($scope.selectedValues).filter(k => $scope.selectedValues[k]);

        // Không disable nếu chưa chọn thuộc tính nào
        if (selectedAttributes.length === 0) return false;

        // Kiểm tra nếu giá trị không khớp với SPCT phù hợp
        const matchingSPCTs = $scope.sanPham.sanphamchitiets.filter(spct =>
            selectedAttributes.every(selected =>
                spct.thuocTinhs.some(thuocTinh => thuocTinh.tenthuoctinhchitiet === selected)
            )
        );

        return !matchingSPCTs.some(spct =>
            spct.thuocTinhs.some(thuocTinh => thuocTinh.tenthuoctinhchitiet === value)
        );
    };





    $scope.MuaSanPham = async function () {
        // Lấy danh sách các thuộc tính đã chọn
        const tenthuoctinhList = Object.keys($scope.selectedValues).filter(key => $scope.selectedValues[key]);

        if (!$scope.selectedSPCTs || $scope.selectedSPCTs[0].soluong === 0) {
            console.log("Không thể mua sản phẩm do hết hàng.");
            return;
        }
        // Kiểm tra xem tất cả các thuộc tính có được chọn chưa
        if (tenthuoctinhList.length === Object.keys($scope.groupedThuocTinhs).length) {
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
                        $location.path(`/muasanpham/${firstSPCTId}`); // Chuyển sang trang mua sản phẩm
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
            // Hiển thị thông báo nếu chưa chọn đủ tất cả các thuộc tính
            $scope.errorMessage = "Vui lòng chọn tất cả các thuộc tính của sản phẩm.";
            console.log($scope.errorMessage);
        }
    };


});
