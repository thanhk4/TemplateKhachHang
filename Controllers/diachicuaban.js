app.controller("DiachicuabanCtrl", function ($document, $scope, $rootScope) {
    // Kiểm tra đăng nhập
    if (!$rootScope.isLoggedIn) {
        $location.path('/login');
        return;
    }

    // Lấy thông tin người dùng từ localStorage
    $scope.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    let link = angular.element('<link rel="stylesheet" href="css/diachicuaban.css">');
    $document.find('head').append(link);
    $rootScope.$on('$destroy', function () {
        link.remove();
    });

    const host = "https://provinces.open-api.vn/api/";

    // Hàm để xóa dữ liệu trong các dropdown
    var clearDropdowns = () => {
        ["province", "district", "ward"].forEach(id => {
            const element = document.querySelector(`#${id}`);
            if (element) {
                element.innerHTML = `<option disabled value="">Chọn ${id === "province" ? "Tỉnh" : id === "district" ? "Quận" : "Phường"}</option>`;
                element.disabled = id !== "province"; // Chỉ mở khóa dropdown tỉnh ban đầu
            }
        });
        const resultElement = document.querySelector("#result");
        if (resultElement) resultElement.textContent = ''; // Xóa kết quả hiển thị
    };
    

    // Làm sạch dropdown và kết quả khi modal được mở
    clearDropdowns();

    // Gọi API lấy dữ liệu tỉnh
    var callAPI = (api) => {
        return axios.get(api)
            .then((response) => {
                if (!response.data || response.data.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu tỉnh!", "error");
                    return [];
                }
                renderData(response.data, "province");
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
                Swal.fire("Lỗi", "Không thể kết nối tới máy chủ!", "error");
            });
    };
    

    // Gọi API lấy dữ liệu quận
    var callApiDistrict = (api) => {
        return axios.get(api)
            .then((response) => {
                if (!response.data.districts || response.data.districts.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu quận!", "error");
                    return [];
                }
                renderData(response.data.districts, "district");
                document.querySelector("#district").disabled = false;
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API quận:", error);
            });
    };
    

    // Gọi API lấy dữ liệu phường
    var callApiWard = (api) => {
        return axios.get(api)
            .then((response) => {
                if (response.data.wards.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu phường!", "error");
                } else {
                    renderData(response.data.wards, "ward"); // Gọi hàm render để hiển thị dữ liệu phường
                    document.querySelector("#ward").disabled = false;  // Mở khóa dropdown phường
                }
            });
    };

    // Hàm để render dữ liệu vào các dropdown
    var renderData = (array, select) => {
        let row = '<option disabled value="">Chọn</option>';
        array.forEach(element => {
            row += `<option value="${element.code}">${element.name}</option>`; // Thêm các option vào dropdown
        });
        if (document.querySelector("#" + select)) {
            document.querySelector("#" + select).innerHTML = row; // Cập nhật nội dung dropdown
        }
    };

    // Gọi API để tải danh sách tỉnh khi modal mở
    callAPI('https://provinces.open-api.vn/api/?depth=1');

    // Lắng nghe sự thay đổi của dropdown Tỉnh
    if (document.querySelector("#province")) {
        document.querySelector("#province").addEventListener("change", () => {
            let provinceCode = document.querySelector("#province").value;
            if (provinceCode) {
                callApiDistrict(host + "p/" + provinceCode + "?depth=2"); // Gọi API lấy quận khi chọn tỉnh
            }
            printResult(); // Cập nhật kết quả
        });
    }

    // Lắng nghe sự thay đổi của dropdown Quận
    if (document.querySelector("#district")) {
        document.querySelector("#district").addEventListener("change", () => {
            let districtCode = document.querySelector("#district").value;
            if (districtCode) {
                callApiWard(host + "d/" + districtCode + "?depth=2"); // Gọi API lấy phường khi chọn quận
            }
            printResult(); // Cập nhật kết quả
        });
    }

    // Lắng nghe sự thay đổi của dropdown Phường
    if (document.querySelector("#ward")) {
        document.querySelector("#ward").addEventListener("change", printResult); // Cập nhật kết quả khi chọn phường
    }

    // Hàm để hiển thị kết quả đã chọn từ các dropdown
    var printResult = () => {
        let province = document.querySelector("#province") ? document.querySelector("#province").value : '';
        let district = document.querySelector("#district") ? document.querySelector("#district").value : '';
        let ward = document.querySelector("#ward") ? document.querySelector("#ward").value : '';

        // Nếu tất cả các dropdown đều có giá trị đã chọn, hiển thị kết quả
        if (province && district && ward) {
            let result = `${document.querySelector("#province").selectedOptions[0].text} | ` +
                `${document.querySelector("#district").selectedOptions[0].text} | ` +
                `${document.querySelector("#ward").selectedOptions[0].text}`;
            if (document.querySelector("#result")) {
                document.querySelector("#result").textContent = result; // Hiển thị kết quả
            }
        }
    };

    var setupDropdownChangeListener = (id, callback) => {
        const element = document.querySelector(`#${id}`);
        if (element) {
            element.addEventListener("change", callback);
        }
    };
    
    // Gắn sự kiện thay đổi cho từng dropdown
    setupDropdownChangeListener("province", () => {
        let provinceCode = document.querySelector("#province").value;
        if (provinceCode) {
            callApiDistrict(`${host}p/${provinceCode}?depth=2`);
        }
        printResult();
    });
    
    setupDropdownChangeListener("district", () => {
        let districtCode = document.querySelector("#district").value;
        if (districtCode) {
            callApiWard(`${host}d/${districtCode}?depth=2`);
        }
        printResult();
    });
    
    setupDropdownChangeListener("ward", printResult);
    
});
