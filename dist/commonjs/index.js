'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ = require('lodash');

var store = void 0;

var configure = function configure(aurelia, storeInstance) {
  if (!storeInstance || (typeof storeInstance === 'undefined' ? 'undefined' : _typeof(storeInstance)) !== 'object') {
    console.error('You need to pass a store to aurelia-redux-immutable configurator function.');
    return;
  }

  store = aurelia.container.get(storeInstance);
};

var getKeys = function getKeys(obj) {
  var keys = [];
  for (var prop in obj) {
    keys.push(prop);
  }
  return keys;
}

var combineArrays = function combineArrays(array1, array2) {
  var combinedArray = array1 ? array1.slice(0) : [];
  array2.forEach(function(val) {
    var bFound = false;
    combinedArray.forEach(function(val1) {
      bFound = true;
    });
    if (!bFound) {
      combinedArray.push(val);
    }
  });
  return combinedArray;
}

var connect = function connect(viewModel, stateMapper, mapByKeyLevel) {
  if (typeof mapByKeyLevel !== 'number' && typeof mapByKeyLevel !== 'undefined') { throw new Error('mayByKeyLevel must be a number'); }
  stateMapper = stateMapper || function (state) {
    return state;
  };
  var state = store.getState();
  var dispatch = store.dispatch;
  var getState = store.getState;
  var stateToShallowCompare = void 0;

  var inject = function inject(mappedState) {
    if (!mapByKeyLevel) {
      viewModel.state = mappedState;
    } else {
      var mappedKeys = getKeys(mappedState);
      mappedKeys.forEach(function(key, index) {
        if (mapByKeyLevel > 1 && typeof mappedState[key] === 'object' && typeof viewModel[key] === 'object' && mappedState[key] !== null && viewModel[key] !== null) {
          var vmPropKeys = getKeys(viewModel[key]);
          var msPropKeys = getKeys(mappedState[key]);
          combineArrays(vmPropKeys, msPropKeys).forEach(function(k) {
            viewModel[key][k] = mappedState[key][k];
          });
        } else {
          viewModel[key] = mappedState[key];
        }
      });
    }
    
    viewModel.dispatch = dispatch;
    viewModel.getState = getState;

    stateToShallowCompare = Object.assign({}, mappedState);
  };
  var subscribe = function subscribe() {
    var newMappedState = stateMapper(store.getState());
    if (!_.isEqual(stateToShallowCompare, newMappedState)) {
      inject(newMappedState);
    }
  };
  var unsubscribe = store.subscribe(subscribe);
  var originalDetached = (viewModel.detached && viewModel.detached.bind(viewModel)) || function () {};
  viewModel.detached = function () {
    originalDetached();
    unsubscribe();
  };

  inject(stateMapper(state));
};

exports.default = connect;
exports.configure = configure;
