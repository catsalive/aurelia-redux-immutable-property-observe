define(['exports', 'lodash'], function (exports, _) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = undefined;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var store = void 0;

  var configure = function configure(aurelia, storeInstance) {
    if (!storeInstance || (typeof storeInstance === 'undefined' ? 'undefined' : _typeof(storeInstance)) !== 'object') {
      console.error('You need to pass a store to aurelia-redux-immutable configurator function.');
      return;
    }

    store = aurelia.container.get(storeInstance);
  };

  var connect = function connect(viewModel, stateMapper, mapByKeyLevel) {
    if (typeof mapByKeyLevel !== 'number' && typeof mapByKeyLevel !== 'undefined') { throw new Error('mayByKeyLevel must be a number'); }
    stateMapper = stateMapper || function (state) {
      return state;
    };
    var state = store.getState();
    var dispatch = store.dispatch;
    var stateToShallowCompare = void 0;

    var inject = function inject(mappedState) {
      if (!mapByKeyLevel) {
        viewModel.state = mappedState;
      } else {
        Object.keys(mappedState).forEach(function(key, index) {
          if (mapByKeyLevel > 1 && typeof mappedState[key] === 'object' && typeof viewModel[key] === 'object' && mappedState[key] !== null && viewModel[key] !== null) {
            Object.keys(viewModel[key]).concat(Object.keys(mappedState[key])).filter((value, ix, array) => array.indexOf(value) === ix).forEach((k) => {
              viewModel[key][k] = mappedState[key][k];
            });
          } else {
            viewModel[key] = mappedState[key];
          }
        });
      }
      
      viewModel.dispatch = dispatch;

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
});
