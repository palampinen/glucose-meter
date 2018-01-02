angular
  .module('glucoseNotes.controllers', [])

  .controller('AppCtrl', function($scope, $ionicModal) {
    $ionicModal
      .fromTemplateUrl('modal-add.html', {
        scope: $scope,
        animation: 'slide-in-up',
      })
      .then(function(modal) {
        $scope.modal = modal;
      });
    $scope.openAddModal = function() {
      $scope.modal.show();
    };
    $scope.closeAddModal = function() {
      $scope.modal.hide();
    };
  })

  .controller('IntroCtrl', function($scope, User, $state, $timeout) {
    $scope.$on('$ionicView.leave', function(event, data) {
      $scope.saved = false;
    });
    $scope.user = User.get();

    $scope.save = function(username) {
      if (username != '') {
        User.save(username);
        $scope.saved = true;
        $timeout(function() {
          $state.go('tab.feed');
        }, 1000);
      } else {
        $scope.failed = true;
      }
    };
  });
