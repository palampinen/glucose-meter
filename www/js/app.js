// Glucose Notes App
angular
  .module('glucoseNotes', [
    'ionic',
    'glucoseNotes.controllers',
    'glucoseNotes.services',
    'firebase',
    'templates',
    'config',
    'pr.longpress',
    'ion-sticky',
  ])

  .run(function($ionicPlatform, $state, User) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      if (!User.get()) $state.go('intro');
    });
  })

  .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.text('');

    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '',
        abstract: true,
        templateUrl: 'tabs.html',
        controller: 'AppCtrl',
      })

      // Each tab has its own nav history stack:
      .state('tab.feed', {
        url: '/history',
        views: {
          'tab-feed': {
            templateUrl: 'tab-feed.html',
            controller: 'FeedCtrl',
          },
        },
      })

      .state('tab.chart', {
        url: '/chart',
        views: {
          'tab-chart': {
            templateUrl: 'tab-chart.html',
            controller: 'ChartCtrl',
          },
        },
      })
      .state('tab.account', {
        url: '/account',
        views: {
          'tab-feed': {
            templateUrl: 'tab-account.html',
            controller: 'IntroCtrl',
          },
        },
      })
      .state('intro', {
        url: '/intro',
        templateUrl: 'tab-intro.html',
        controller: 'IntroCtrl',
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/history');
  });
