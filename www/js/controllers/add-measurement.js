angular
  .module('glucoseNotes.controllers')

  .controller('AddMeasurementCtrl', function(
    $scope,
    $state,
    Smiley,
    SmileyStorage,
    Post,
    $ionicScrollDelegate,
    $timeout,
    Helpers,
    $http,
    User,
    MeasurementTypes
  ) {
    var resetForm = function() {
      $scope.measurement1 = null;
      $scope.measurement2 = null;
      $scope.measurementTime = null;
      $scope.customTime = null;
      $scope.editTime = false;
    };
    resetForm();

    $scope.updateTime = function(time) {
      $scope.customTime = time;
    };

    $scope.toggleEditTime = function() {
      $scope.editTime = !$scope.editTime;

      $timeout(function() {
        if ($scope.editTime) {
          document.getElementById('time-input').click();
        }
      }, 100);
    };

    // Reset tools when view is closed
    $scope.$on('$ionicView.leave', function() {});

    //
    // # Saving post
    // Different logic for saving Drawing, GIF and Photo
    $scope.submitMeasurements = function(m1, m2, isCustomTime, customTime) {
      $scope.loading = true;

      function toStart(a) {
        resetForm();
        $scope.loading = false;
        $scope.saveOK = true;

        $timeout(function() {
          $scope.closeAddModal();
          $scope.saveOK = false;
          $timeout(function() {
            $ionicScrollDelegate.scrollTop();
          }, 100); // scroll top if bottom of list
        }, 1700); // timeout for save animation
      }

      var hasCustomTime = isCustomTime && $scope.customTime;
      var staticPostData = {
        nick: User.get(),
        added: hasCustomTime ? new Date($scope.customTime).getTime() : new Date().getTime(),
      };

      var measurementData = {};
      var postData;

      if (!m1 && !m2) {
        $scope.loading = false;
        return;
      }

      if (m1) {
        measurementData[MeasurementTypes.LIBRE] = m1;
      }

      if (m2) {
        measurementData[MeasurementTypes.ACCU] = m2;
      }

      postData = Object.assign({}, staticPostData, measurementData);

      Smiley.$add(postData).then(toStart);
    };
  });
