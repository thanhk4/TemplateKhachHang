// API chính để lấy và thêm địa chỉ từ hệ thống
app.controller("diachiController", function ($scope, $document, $rootScope)
{
const apiAddressList = "https://localhost:7297/api/Diachis";

// Lấy danh sách địa chỉ theo idKH
const loadAddressesByIdKH = async () => {
    const idKH = GetByidKH(); // Hàm logic lấy idKH
    const addressSelect = document.getElementById("addressSelect");
    
    // Reset nội dung của select
    addressSelect.innerHTML = '<option disabled selected value="">Đang tải...</option>';
    addressSelect.disabled = true;

    if (!idKH) {
        Swal.fire("Lỗi", "Không tìm thấy mã khách hàng.", "error");
        return;
    }

    try {
        const response = await axios.get(`${apiAddressList}/khachhang/${idKH}`);

        if (response.data.length === 0) {
            // Không có địa chỉ
            addressSelect.innerHTML = '<option disabled selected value="">Tài khoản này chưa có địa chỉ, vui lòng thêm địa chỉ</option>';
            addressSelect.disabled = true;
            Swal.fire("Thông báo", "Không có địa chỉ nào liên quan đến khách hàng này.", "info");
        } else {
            // Có địa chỉ
            addressSelect.innerHTML = '<option disabled selected value="">Chọn địa chỉ...</option>';
            response.data.forEach(address => {
                addressSelect.innerHTML += `<option value="${address.idkh}">${address.thanhpho}, ${address.quanhuyen}, ${address.phuongxa}, ${address.diachicuthe}</option>`;
            });
            addressSelect.disabled = false; // Kích hoạt select khi có dữ liệu
        }
    } catch (error) {
        addressSelect.innerHTML = '<option disabled selected value="">Không thể tải địa chỉ</option>';
        Swal.fire("Lỗi", "Không thể tải danh sách địa chỉ.", "error");
        console.error(error);
    }
};
});