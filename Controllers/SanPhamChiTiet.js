app.controller("SanPhamChiTietCtrl", function ($scope, $http, $rootScope, $document) {
    // Thêm CSS vào trang khi controller được khởi tạo
    let link = angular.element('<link rel="stylesheet" href="css/SanPhamChiTiet.css">');
    $document.find('head').append(link);

    // Xử lý việc xóa CSS khi controller bị hủy
    $rootScope.$on('$destroy', function() {
        link.remove();
    });

    const apiSPCTUrl = "https://localhost:7297/api/Sanphamchitiet/sanpham";
    const apiSPUrl = "https://localhost:7297/api/Sanpham";
    const apiTTSPCTUrl = "https://localhost:7297/api/Sanphamchitiet/thuoctinh";
    const apiTTUrl = "https://localhost:7297/api/Thuoctinh";

    const productId = 1; // ID sản phẩm (có thể lấy từ URL hoặc chuyển động)
    
    $scope.product = {};
    $scope.attributes = [];
    $scope.quantity = 1;

    // Lấy thông tin sản phẩm từ API Sanpham
    $http.get(`${apiSPUrl}/${productId}`).then(function(response) {
        const product = response.data;
        if (product) {
            $scope.product.name = product.tensp;
            $scope.product.description = product.mota;
            $scope.product.images = product.urlHinhanh; 
            $scope.product.maxQuantity = product.soluong;
            $scope.product.price = product.giaban;
        }
    }).catch(function(error) {
        console.error("Lỗi khi lấy thông tin sản phẩm: ", error);
    });

    // Hàm lấy thông tin chi tiết sản phẩm từ API Sanphamchitiet/sanpham
    $http.get(`${apiSPCTUrl}/${productId}`).then(function(response) {
        const productDetails = response.data;
        if (productDetails) {
            const productDetailIds = productDetails.map(item => item.id); // Lấy danh sách ID sản phẩm chi tiết
            // Tiến hành lấy thuộc tính cho các ID sản phẩm chi tiết vừa nhận được
            fetchThuocTinhSPCT(productDetailIds).then(function(thuocTinhList) {
                $scope.attributes = thuocTinhList;  // Gán dữ liệu thuộc tính vào $scope.attributes
                $scope.$apply();  // Cập nhật giao diện với thuộc tính mới lấy được
                createThuocTinhSelects(thuocTinhList); // Gọi hàm tạo giao diện
            }).catch(function(error) {
                console.error("Lỗi khi lấy danh sách thuộc tính sản phẩm chi tiết: ", error);
            });
        }
    }).catch(function(error) {
        console.error("Lỗi khi lấy thông tin sản phẩm chi tiết: ", error);
    });

    // Hàm lấy thông tin thuộc tính sản phẩm chi tiết từ API
    async function fetchThuocTinhSPCT(ids) {
        try {
            // Kiểm tra nếu không có ID nào được truyền vào
            if (!ids || ids.length === 0) {
                console.error('Danh sách ID không hợp lệ:', ids);
                return []; // Trả về mảng rỗng
            }

            // Tạo các lời gọi API cho mỗi ID và lưu chúng vào một mảng promise
            const promises = ids.map(id => {
                const url = `${apiTTSPCTUrl}/${id}`;
                return fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (!Array.isArray(data)) {
                            console.warn('Dữ liệu không phải là mảng:', data);
                            return []; // Trả về mảng rỗng nếu dữ liệu không hợp lệ
                        }
                        return data;  // Trả về dữ liệu nếu hợp lệ
                    })
                    .catch(error => {
                        console.error(`Lỗi khi lấy thuộc tính cho ID ${id}:`, error);
                        return [];  // Trả về mảng rỗng nếu có lỗi
                    });
            });

            // Chờ tất cả các yêu cầu hoàn thành và nhận kết quả
            const results = await Promise.all(promises);
            
            // Kết quả trả về là một mảng các thuộc tính cho từng ID
            return results;
        } catch (error) {
            console.error('Lỗi khi lấy thông tin thuộc tính sản phẩm chi tiết:', error);
            return [];  // Trả về mảng rỗng nếu có lỗi
        }
    }

    // Hàm tạo giao diện các thuộc tính dưới dạng checkbox
    function createThuocTinhSelects(thuocTinhList, id) {
        let thuocTinhSelects = '';
        thuocTinhList.forEach(tt => {
            thuocTinhSelects += `
               <div 
                    class="badge bg-primary text-white text-center d-inline-block me-2" 
                    id="select-ttspct-${tt.idtt}" 
                    style="pointer-events: none;">
                    ${tt.tenthuoctinhchitiet}
                </div>
            `;
        });
    
        // Chèn các checkbox vào #thuoc-tinh-container
        document.getElementById('thuoc-tinh-container').innerHTML = thuocTinhSelects;
    }

    // Hàm tăng số lượng
    $scope.increaseQuantity = function() {
        if ($scope.quantity < $scope.product.maxQuantity) {
            $scope.quantity++;
        }
    };

    // Hàm giảm số lượng
    $scope.decreaseQuantity = function() {
        if ($scope.quantity > 1) {
            $scope.quantity--;
        }
    };

    // Hàm thêm vào giỏ hàng
    $scope.addToCart = function() {
        console.log("Sản phẩm đã được thêm vào giỏ hàng");
        // Thực hiện thêm sản phẩm vào giỏ hàng ở đây
        // Có thể gọi API hoặc lưu vào localStorage, sessionStorage, hoặc cookie tùy vào yêu cầu
    };
});
