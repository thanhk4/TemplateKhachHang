app.controller('timkiemController', function ($scope, $routeParams, $http) {
  // Capture the search term from the route parameter
  $scope.searchKey = $routeParams.search;
  $scope.filteredResults = [];
  $scope.displayResults = [];
  $scope.errorMessage = '';
  $scope.priceFilter = { min: null, max: null };
  $scope.brandFilter = [];

  // Fetch brand data from API
  $http.get('https://localhost:7297/api/Thuonghieu')
      .then(function (response) {
          $scope.dataThuonghieu = response.data;
      })
      .catch(function (error) {
          console.log(error);
      });

  // Fetch search results from the API based on the searchKey
  $scope.searchProducts = function () {
      $http.get(`https://localhost:7297/api/Sanpham/search?name=${encodeURIComponent($scope.searchKey)}`)
      .then(function success(response) {
          $scope.filteredResults = response.data;
          $scope.displayResults = [...$scope.filteredResults];  // Initialize displayResults
      }, function error(response) {
          $scope.errorMessage = 'Không thể tải dữ liệu từ server. Vui lòng thử lại!';
          console.error('API Error:', response);
      });
  };

  // Call the search function when the controller loads
  $scope.searchProducts();

  // Apply price filter
  $scope.applyPriceFilter = function () {
      const minPrice = $scope.priceFilter.min || 0;
      const maxPrice = $scope.priceFilter.max || Infinity;

      $scope.displayResults = $scope.filteredResults.filter(item => {
          return item.giaban >= minPrice && item.giaban <= maxPrice;
      });
  };

  // Apply brand filter
  $scope.applyBrandFilter = function () {
      if ($scope.brandFilter.length > 0) {
          $scope.displayResults = $scope.filteredResults.filter(item => {
              return $scope.brandFilter.includes(item.thuonghieu);
          });
      } else {
          $scope.displayResults = [...$scope.filteredResults];
      }
  };

  // Reset Filters
  $scope.resetFilters = function () {
      $scope.priceFilter.min = null;
      $scope.priceFilter.max = null;
      $scope.brandFilter = [];
      $scope.displayResults = [...$scope.filteredResults];
  };
});
