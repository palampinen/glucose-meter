angular
  .module('glucoseNotes.services', [])
  .constant('MeasurementTypes', {
    LIBRE: 'LIBRE',
    ACCU: 'ACCU',
  })

  /**
   * Service that returns Measurement data from Firebase.
   */
  .factory('Measurement', function($firebaseArray, CONFIG) {
    var ref = firebase.database().ref(CONFIG.fbRoot);
    // Add three-way data binding
    return $firebaseArray(ref);
  })

  .factory('MeasurementService', function($firebaseArray, $firebaseObject, CONFIG) {
    var ref = firebase.database().ref(CONFIG.fbRoot);

    // Add three-way data binding
    return {
      load: function(limit) {
        var query = ref.orderByChild('added').limitToLast(limit);
        return $firebaseArray(query);
      },
      loadBefore: function(before, after) {
        if (!userName) {
          return false;
        }

        var query = after
          ? ref
              .orderByChild('added')
              .startAt(before)
              .endAt(after)
          : ref.orderByChild('added').startAt(before);
        return $firebaseArray(query);
      },
      get: function(id) {
        var query = ref.child(id);
        return $firebaseObject(query);
      },
      findByUser: function(userName) {
        var query = ref.orderByChild('nick').equalTo(userName);
        return $firebaseArray(query);
      },
      remove: function(item) {
        return item.$remove();
      },
    };
  })

  .factory('User', function() {
    var prefix = 'glucosenotes-';
    return {
      get: function() {
        if (localStorage.getItem(prefix + 'name') == null) {
          return '';
        }

        return localStorage.getItem(prefix + 'name');
      },
      save: function(name) {
        // Simple index lookup
        return localStorage.setItem(prefix + 'name', name);
      },
      lastChecked: function() {
        // with refresh
        var tmp = localStorage.getItem(prefix + 'lasttime-checked');
        if (!tmp) {
          tmp = 0;
        }
        localStorage.setItem(prefix + 'lasttime-checked', new Date().getTime());
        return tmp;
      },
      last: function() {
        // without refresh
        var tmp = localStorage.getItem(prefix + 'lasttime-checked');
        if (!tmp) return 0;
        return tmp;
      },
      getSetting: function(key) {
        return !!localStorage.getItem(prefix + key);
      },
      setSetting: function(key, value) {
        if (value) {
          localStorage.setItem(prefix + key, value);
        } else {
          localStorage.removeItem(prefix + key);
        }
      },
      getListMode: function() {
        return this.getSetting('listMode');
      },
      setListMode: function(listMode) {
        this.setSetting('listMode', listMode);
      },
      getShowDatesMode: function() {
        return this.getSetting('showDates');
      },
      setShowDatesMode: function(value) {
        this.setSetting('showDates', value);
      },
    };
  })

  .factory('Helpers', function() {
    return {
      getTimeAgo: function(timeAgo) {
        if (!timeAgo) {
          return '';
        }

        var ago = parseInt(timeAgo);

        var day = 60 * 24;
        var diffInMinutes = (new Date().getTime() - ago) / 60000; // minutes
        var diffInDays = diffInMinutes / day; // days

        var agoFormat = 'ddd HH:mm';

        // Today
        if (diffInDays <= 1) {
          agoFormat = 'HH:mm';
        }

        // Later than this week
        if (diffInDays > 6) {
          agoFormat = 'ddd D.M. HH:mm';
        }

        return moment(ago).format(agoFormat);
      },

      countDiff(a, b) {
        if (_.isNil(a) || _.isNil(b)) {
          return null;
        }
        var valA = parseFloat(a);
        var valB = parseFloat(b);
        var diff = _.round(valA - valB, 1).toFixed(1);

        var prefix = diff > 0 ? '+' : '';

        return `${prefix}${diff}`;
      },
      formatMeasurement(value) {
        if (_.isNil(value)) {
          return '-';
        }

        return _.round(parseFloat(value), 1).toFixed(1);
      },
      composeFileName: function(time, userName, prefix) {
        var imagePrefix = prefix || 'glucose';
        var formattedUserName = userName.replace(/ /g, '-');

        return imagePrefix + '-' + formattedUserName + '-' + time + '.png';
      },
    };
  });
