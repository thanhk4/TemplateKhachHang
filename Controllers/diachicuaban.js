app.controller("DiachicuabanCtrl", function ($document, $scope, $rootScope) {
    // Kiểm tra đăng nhập
    if (!$rootScope.isLoggedIn) {
        $location.path('/login');
        return;
    }


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
        const resultElement = document.querySelector("#updateresult");
        if (resultElement) resultElement.textContent = ''; // Xóa kết quả hiển thị
    };

    // Hàm để xóa dữ liệu trong các dropdown
    var clearDropdownsUpdate = () => {
        ["province", "district", "ward"].forEach(id => {
            const element = document.querySelector(`#${id}`);
            if (element) {
                element.innerHTML = `<option disabled value="">Chọn ${id === "province" ? "Tỉnh" : id === "district" ? "Quận" : "Phường"}</option>`;
                element.disabled = id !== "province"; // Chỉ mở khóa dropdown tỉnh ban đầu
            }
        });
        const resultElement = document.querySelector("#updateresult");
        if (resultElement) resultElement.textContent = ''; // Xóa kết quả hiển thị
    };


    // Làm sạch dropdown và kết quả khi modal được mở
    clearDropdowns();
    clearDropdownsUpdate();

    // Gọi API lấy dữ liệu tỉnh
    var callAPI = (api) => {
        return axios.get(api)
            .then((response) => {
                if (!response.data || response.data.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu tỉnh!", "error");
                    return [];
                }
                renderData(response.data, "province");
                
                const provinceSelect = document.querySelector("#province");
                if (provinceSelect) {
                    const hanoiOption = Array.from(provinceSelect.options).find(option => option.text === "Thành phố Hà Nội");
                    if (hanoiOption) {
                        hanoiOption.selected = true;
                        // Get the code for Hanoi and call the district API
                        const hanoiCode = hanoiOption.value;
                        callApiDistrict(host + "p/" + hanoiCode + "?depth=2");
                    }
                }
            })
    
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
                Swal.fire("Lỗi", "Không thể kết nối tới máy chủ!", "error");
            });
    };

    // Gọi API lấy dữ liệu tỉnh
    var callAPIUpdate = (api) => {
        return axios.get(api)
            .then((response) => {
                if (!response.data || response.data.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu tỉnh!", "error");
                    return [];
                }
                renderDataUpdate(response.data, "province");
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
                const districtSelect = document.querySelector("#district");
                if (districtSelect) {
                    renderData(response.data.districts, "district");
                    districtSelect.disabled = false;
                }
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API quận:", error);
            });
    };

    // Gọi API lấy dữ liệu quận
    var callApiDistrictUpdate = (api) => {
        return axios.get(api)
            .then((response) => {
                if (!response.data.districts || response.data.districts.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu quận!", "error");
                    return [];
                }
                renderDataUpdate(response.data.districts, "district");
                document.querySelector("#updatedistrict").disabled = false;
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

    // Gọi API lấy dữ liệu phường
    var callApiWardUpdate = (api) => {
        return axios.get(api)
            .then((response) => {
                if (response.data.wards.length === 0) {
                    Swal.fire("Lỗi", "Không có dữ liệu phường!", "error");
                } else {
                    renderDataUpdate(response.data.wards, "ward"); // Gọi hàm render để hiển thị dữ liệu phường
                    document.querySelector("#updateward").disabled = false;  // Mở khóa dropdown phường
                }
            });
    };

    // Hàm để render dữ liệu vào các dropdown
    var renderData = (array, select) => {
        let row = '<option disabled value="">Chọn</option>';
        array.forEach(element => {
            row += `<option value="${element.code}">${element.name}</option>`; // Thêm các option vào dropdown
        });
        const selectElement = document.querySelector("#" + select);
    if (selectElement) {
        selectElement.innerHTML = row;
        
        // If this is the province select and Hanoi is being set
        if (select === "province") {
            const hanoiOption = Array.from(selectElement.options).find(option => 
                option.text === "Thành phố Hà Nội"
            );
            if (hanoiOption) {
                hanoiOption.selected = true;
                // Trigger the change event manually
                const event = new Event('change');
                selectElement.dispatchEvent(event);
            }
        }
    }
};
if (document.querySelector("#province")) {
    document.querySelector("#province").addEventListener("change", function() {
        const provinceCode = this.value;
        if (provinceCode) {
            // Clear and disable ward dropdown
            const wardSelect = document.querySelector("#ward");
            if (wardSelect) {
                wardSelect.innerHTML = '<option disabled value="">Chọn Phường/Xã</option>';
                wardSelect.disabled = true;
            }
            
            // Call API to get districts
            callApiDistrict(host + "p/" + provinceCode + "?depth=2");
        }
    });
}


    // Hàm để render dữ liệu vào các dropdown
    var renderDataUpdate = (array, select) => {
        let row = '<option disabled value="">Chọn</option>';
        array.forEach(element => {
            row += `<option value="${element.code}">${element.name}</option>`; // Thêm các option vào dropdown
        });
        if (document.querySelector("#update" + select)) {
            document.querySelector("#update" + select).innerHTML = row; // Cập nhật nội dung dropdown
        }
    };

    // Gọi API để tải danh sách tỉnh khi modal mở
    callAPI('https://provinces.open-api.vn/api/?depth=1');
    callAPIUpdate('https://provinces.open-api.vn/api/?depth=1');

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

    // Lắng nghe sự thay đổi của dropdown Tỉnh
    if (document.querySelector("#updateprovince")) {
        document.querySelector("#updateprovince").addEventListener("change", () => {
            let provinceCode = document.querySelector("#updateprovince").value;
            if (provinceCode) {
                callApiDistrictUpdate(host + "p/" + provinceCode + "?depth=2"); // Gọi API lấy quận khi chọn tỉnh
            }
            printResultUpdate(); // Cập nhật kết quả
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

    // Lắng nghe sự thay đổi của dropdown Quận
    if (document.querySelector("#updatedistrict")) {
        document.querySelector("#updatedistrict").addEventListener("change", () => {
            let districtCode = document.querySelector("#updatedistrict").value;
            if (districtCode) {
                callApiWardUpdate(host + "d/" + districtCode + "?depth=2"); // Gọi API lấy phường khi chọn quận
            }
            printResultUpdate(); // Cập nhật kết quả
        });
    }

    // Lắng nghe sự thay đổi của dropdown Phường
    if (document.querySelector("#ward")) {
        document.querySelector("#ward").addEventListener("change", printResult); // Cập nhật kết quả khi chọn phường
    }

    // Lắng nghe sự thay đổi của dropdown Phường
    if (document.querySelector("#updateward")) {
        document.querySelector("#updateward").addEventListener("change", printResultUpdate); // Cập nhật kết quả khi chọn phường
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

    // Hàm để hiển thị kết quả đã chọn từ các dropdown
    var printResultUpdate = () => {
        let province = document.querySelector("#updateprovince") ? document.querySelector("#updateprovince").value : '';
        let district = document.querySelector("#updatedistrict") ? document.querySelector("#updatedistrict").value : '';
        let ward = document.querySelector("#updateward") ? document.querySelector("#updateward").value : '';

        // Nếu tất cả các dropdown đều có giá trị đã chọn, hiển thị kết quả
        if (province && district && ward) {
            let result = `${document.querySelector("#updateprovince").selectedOptions[0].text} | ` +
                `${document.querySelector("#updatedistrict").selectedOptions[0].text} | ` +
                `${document.querySelector("#updateward").selectedOptions[0].text}`;
            if (document.querySelector("#updateresult")) {
                document.querySelector("#updateresult").textContent = result; // Hiển thị kết quả
            }
        }
    };

    var setupDropdownChangeListener = (id, callback) => {
        const element = document.querySelector(`#${id}`);
        if (element) {
            element.addEventListener("change", callback);
        }
    };

    var setupDropdownChangeListenerUpdate = (id, callback) => {
        const element = document.querySelector(`#Update${id}`);
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

    // Gắn sự kiện thay đổi cho từng dropdown
    setupDropdownChangeListenerUpdate("province", () => {
        let provinceCode = document.querySelector("#updateprovince").value;
        if (provinceCode) {
            callApiDistrictUpdate(`${host}p/${provinceCode}?depth=2`);
        }
        printResultUpdate();
    });

    setupDropdownChangeListenerUpdate("district", () => {
        let districtCode = document.querySelector("#updatedistrict").value;
        if (districtCode) {
            callApiWardUpdate(`${host}d/${districtCode}?depth=2`);
        }
        printResultUpdate();
    });

    setupDropdownChangeListener("ward", printResult);

    setupDropdownChangeListenerUpdate("ward", printResultUpdate);

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

    // API chính để lấy và thêm địa chỉ từ hệ thống
    const apiAddressList = "https://localhost:7297/api/Diachis";
    const idkh = GetByidKH();

    // Lấy danh sách địa chỉ từ API
    fetch(`${apiAddressList}/khachhang/${idkh}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Không thể lấy dữ liệu từ API.");
            }
            return response.json();
        })
        .then(data => {
            renderAddressList(data);
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu:", error);
        });

    // Render danh sách địa chỉ ra giao diện
    function renderAddressList(addresses) {
        const addressContainer = document.querySelector(".diachi-list"); // Chọn đúng div .diachi-list
        addressContainer.innerHTML = addresses.map(address => `
        <div class="address-item">
            <h6>${address.ten}<span> - </span><span class="text-muted">${address.sdt}</span></h6>
            <div class="d-flex justify-content-between align-items-center">
                <p>${address.diachicuthe}, ${address.phuongxa} - ${address.quanhuyen} - ${address.thanhpho}</p>
                <div class="mt-2">
                    <a class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#updateDiaChi" data-id="${address.id}" onclick="loadUpdateForm(${address.id})">Cập nhật</a>
                    <a class="btn btn-outline-danger" data-id="${address.id}" onclick="deleteAddress(${address.id})">Xóa</a>
                </div>
            </div>
        </div>
    `).join("");
    }

    window.loadUpdateForm = function (id) {
        fetch(`${apiAddressList}/${id}`)
            .then(response => response.json())
            .then(address => {
                document.getElementById("updateAddressId").value = id;
                document.getElementById("Updatetennguoinhan").value = address.ten;
                document.getElementById("Updatesdtnguoinhan").value = address.sdt;
                document.getElementById("UpdatedetailInput").value = address.diachicuthe;
    
                // Gọi API để lấy danh sách tỉnh/thành phố
                fetch('https://provinces.open-api.vn/api/?depth=1')
                    .then(response => response.json())
                    .then(provinces => {
                        const updateProvince = document.getElementById("updateprovince");
                        updateProvince.innerHTML = '<option disabled value="">Chọn Tỉnh/Thành</option>';
                        provinces.forEach(province => {
                            const option = document.createElement('option');
                            option.value = province.code;
                            option.textContent = province.name;
                            option.selected = province.name === address.thanhpho;
                            updateProvince.appendChild(option);
                        });
    
                        // Sau khi chọn tỉnh/thành, gọi API để lấy quận/huyện
                        const selectedProvince = updateProvince.options[updateProvince.selectedIndex];
                        if (selectedProvince) {
                            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.value}?depth=2`)
                                .then(response => response.json())
                                .then(data => {
                                    const updateDistrict = document.getElementById("updatedistrict");
                                    updateDistrict.innerHTML = '<option disabled value="">Chọn Quận/Huyện</option>';
                                    updateDistrict.disabled = false;
                                    data.districts.forEach(district => {
                                        const option = document.createElement('option');
                                        option.value = district.code;
                                        option.textContent = district.name;
                                        option.selected = district.name === address.quanhuyen;
                                        updateDistrict.appendChild(option);
                                    });
    
                                    // Sau khi chọn quận/huyện, gọi API để lấy phường/xã
                                    const selectedDistrict = updateDistrict.options[updateDistrict.selectedIndex];
                                    if (selectedDistrict) {
                                        fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.value}?depth=2`)
                                            .then(response => response.json())
                                            .then(data => {
                                                const updateWard = document.getElementById("updateward");
                                                updateWard.innerHTML = '<option disabled value="">Chọn Phường/Xã</option>';
                                                updateWard.disabled = false;
                                                data.wards.forEach(ward => {
                                                    const option = document.createElement('option');
                                                    option.value = ward.code;
                                                    option.textContent = ward.name;
                                                    option.selected = ward.name === address.phuongxa;
                                                    updateWard.appendChild(option);
                                                });
                                            });
                                    }
                                });
                        }
                    });
            })
            .catch(error => console.error("Lỗi khi lấy dữ liệu địa chỉ:", error));
    }

    document.getElementById("updateForm").addEventListener("click", function (event) {
        event.preventDefault();
    
        const id = document.getElementById("updateAddressId").value;
        const ten = document.getElementById("Updatetennguoinhan").value.trim();
        const sdt = document.getElementById("Updatesdtnguoinhan").value.trim();
        const provinceElement = document.getElementById("updateprovince");
        const districtElement = document.getElementById("updatedistrict");
        const wardElement = document.getElementById("updateward");
        const diachicuthe = document.getElementById("UpdatedetailInput").value.trim();
        const idkh = GetByidKH();

        // check select
        const thanhphocheck = provinceElement.value;
        const quanhuyencheck = districtElement.value;
        const phuongxacheck = wardElement.value;

        // Validate từng trường nhập
        if (!ten) {
            alert("Tên người nhận không được để trống!");
            return;
        }
    
        if (!sdt) {
            alert("Số điện thoại không được để trống!");
            return;
        }
    
        // Kiểm tra số điện thoại
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(sdt)) {
            alert("Số điện thoại phải gồm đúng 10 số và không chứa ký tự khác!");
            return;
        }
    
        if (!thanhphocheck) {
            alert("Vui lòng chọn tỉnh/thành phố!");
            return;
        }
    
        if (quanhuyencheck == "" && districtElement.disabled == true) {
            alert("Vui lòng chọn quận/huyện!");
            return;
        }
    
        if (phuongxacheck == "" && wardElement.disabled == true) {
            alert("Vui lòng chọn phường/xã!");
            return;
        }
    
        if (!diachicuthe) {
            alert("Địa chỉ cụ thể không được để trống!");
            return;
        }
    
        if (!idkh) {
            alert("Lỗi: Không tìm thấy ID khách hàng!");
            return;
        }
        
        // Lấy giá trị từ các select box
        const thanhpho = provinceElement.selectedOptions[0].text;
        const quanhuyen = districtElement.selectedOptions[0].text;
        const phuongxa = wardElement.selectedOptions[0].text;

        const updatedAddress = {
            ten,
            sdt,
            idkh,
            thanhpho,
            quanhuyen,
            phuongxa,
            diachicuthe
        };
    
        // Gửi yêu cầu cập nhật
        fetch(`${apiAddressList}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedAddress)
        })
            .then(response => {
                if (response.ok) {
                    Swal.fire("Thành công", "Cập nhật địa chỉ thành công!", "success")
                    .then((result) => {
                        // Kiểm tra nếu người dùng nhấn OK (hoặc nhấn vào nút xác nhận)
                        if (result.isConfirmed) {
                          // Sau khi nhấn OK, sẽ thực hiện reload trang
                          location.reload();
                        }
                      });  
                } else {
                    Swal.fire("Lỗi", "Cập nhật thất bại, vui lòng thử lại.", "error");
                }
            })
            .catch(error => {
                console.error("Lỗi khi cập nhật địa chỉ:", error);
            });
    });
       

    // Hàm xóa địa chỉ
    window.deleteAddress = function (id) {
        if (confirm("Bạn có chắc muốn xóa địa chỉ này không?")) {
            fetch(`${apiAddressList}/${id}`, {
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire("Thành công", "Xóa địa chỉ thành công!", "success")
                        .then((result) => {
                            // Kiểm tra nếu người dùng nhấn OK (hoặc nhấn vào nút xác nhận)
                            if (result.isConfirmed) {
                              // Sau khi nhấn OK, sẽ thực hiện reload trang
                              location.reload();
                            }
                          }); 
                    } else {
                        Swal.fire("Lỗi", "Xóa thất bại, vui lòng thử lại.", "error");
                    }
                })
                .catch(error => {
                    console.error("Lỗi khi xóa địa chỉ:", error);
                });
        }
    };

    document.getElementById("btnSaveAddress").addEventListener("click", async () => {
        const ten = document.getElementById("tennguoinhan").value.trim();
        const sdt = document.getElementById("sdtnguoinhan").value.trim();
        const provinceElement = document.getElementById("province");
        const districtElement = document.getElementById("district");
        const wardElement = document.getElementById("ward");
        const diachicuthe = document.getElementById("detailInput").value.trim();
        const idkh = GetByidKH();

        // check select
        const thanhphocheck = provinceElement.value;
        const quanhuyencheck = districtElement.value;
        const phuongxacheck = wardElement.value;

        // Validate từng trường nhập
        if (!ten) {
            alert("Tên người nhận không được để trống!");
            return;
        }
    
        if (!sdt) {
            alert("Số điện thoại không được để trống!");
            return;
        }
    
        // Kiểm tra số điện thoại
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(sdt)) {
            alert("Số điện thoại phải gồm đúng 10 số và không chứa ký tự khác!");
            return;
        }
    
        if (!thanhphocheck) {
            alert("Vui lòng chọn tỉnh/thành phố!");
            return;
        }
    
        if (quanhuyencheck == "" && districtElement.disabled == true) {
            alert("Vui lòng chọn quận/huyện!");
            return;
        }
    
        if (phuongxacheck == "" && wardElement.disabled == true) {
            alert("Vui lòng chọn phường/xã!");
            return;
        }
    
        if (!diachicuthe) {
            alert("Địa chỉ cụ thể không được để trống!");
            return;
        }
    
        if (!idkh) {
            alert("Lỗi: Không tìm thấy ID khách hàng!");
            return;
        }

        try {
            const response = await fetch(`${apiAddressList}/khachhang/${idkh}`);
            if (!response.ok) {
                Swal.fire("Lỗi", "Không thể kiểm tra danh sách địa chỉ. Vui lòng thử lại sau!", "error");
                return;
            }
    
            const addressList = await response.json();
            if (addressList.length >= 5) {
                Swal.fire("Lỗi", "Khách hàng này đã có quá 5 địa chỉ. Không thể thêm mới!", "error");
                return;
            }
        } catch (error) {
            console.error("Lỗi khi kiểm tra danh sách địa chỉ:", error);
            Swal.fire("Lỗi", "Đã xảy ra lỗi khi kiểm tra danh sách địa chỉ.", "error");
            return;
        }
        
        // Lấy giá trị từ các select box
        const thanhpho = provinceElement.selectedOptions[0].text;
        const quanhuyen = districtElement.selectedOptions[0].text;
        const phuongxa = wardElement.selectedOptions[0].text;
    
        const newAddress = {
            ten,
            sdt,
            idkh,
            thanhpho,
            quanhuyen,
            phuongxa,
            diachicuthe
        };
    
        try {
            await axios.post(apiAddressList, newAddress);
            Swal.fire("Thành công", "Địa chỉ mới đã được lưu.", "success")
            .then((result) => {
                // Kiểm tra nếu người dùng nhấn OK (hoặc nhấn vào nút xác nhận)
                if (result.isConfirmed) {
                  // Sau khi nhấn OK, sẽ thực hiện reload trang
                  location.reload();
                }
              }); 
        } catch (error) {
            Swal.fire("Lỗi", "Không thể lưu địa chỉ mới.", "error");
            console.error(error);
        }
    });    
});
