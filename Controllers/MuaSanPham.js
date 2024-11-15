app.controller("MuaSanPhamCtrl", function ($scope, $document, $rootScope) {

    window.onload = function() {
        if (quantityInput && priceElement) {
            updateTotalPrice(); // Tính toán tổng số tiền khi trang tải lần đầu
        }
    };
    
    let link = angular.element('<link rel="stylesheet" href="css/MuaSanPham.css">');
    $document.find('head').append(link);
    $rootScope.$on('$destroy', function() {
      link.remove();
    });

    // Lấy các phần tử HTML
    const quantityInput = document.getElementById('quantity');
    const incrementButton = document.getElementById('button-addon2');
    const decrementButton = document.getElementById('button-addon1');
    const priceElement = document.getElementById('product-price'); // Phần tử giá sản phẩm
    const totalElement = document.getElementById('total-price'); // Phần tử tổng số tiền

    // Hàm tính tổng số tiền
    function updateTotalPrice() {
        const price = parseFloat(priceElement.textContent.replace('₫', '').replace('.', '').trim()); // Lấy giá sản phẩm
        const quantity = parseInt(quantityInput.value); // Lấy số lượng
        const total = price * quantity; // Tính tổng số tiền
        totalElement.textContent = total.toLocaleString() + '₫'; // Cập nhật tổng số tiền
    }

    // Sự kiện khi nhấn nút tăng số lượng
    incrementButton.addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
        updateTotalPrice(); // Cập nhật lại tổng số tiền khi thay đổi số lượng
    });

    // Sự kiện khi nhấn nút giảm số lượng
    decrementButton.addEventListener('click', () => {
        if (parseInt(quantityInput.value) > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
            updateTotalPrice(); // Cập nhật lại tổng số tiền khi thay đổi số lượng
        }
    });

    // Sự kiện khi thay đổi trực tiếp số lượng trong input
    quantityInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, ''); // Chỉ cho phép nhập số
        updateTotalPrice(); // Cập nhật lại tổng số tiền khi thay đổi số lượng
    });

});
