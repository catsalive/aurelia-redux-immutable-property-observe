import * as _ from 'lodash';

let store;

const configure = (aurelia, storeInstance) => {
  if (!storeInstance || typeof(storeInstance) !== 'object') {
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

const connect = (viewModel, stateMapper, mapByKeyLevel) => {
  if (typeof mapByKeyLevel !== 'number' && typeof mapByKeyLevel !== 'undefined') { throw new Error('mayByKeyLevel must be a number'); }
  stateMapper = stateMapper || ((state) => state);
  const state = store.getState();
  const dispatch = store.dispatch;
  let stateToShallowCompare;

  const inject = (mappedState) => {
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

    stateToShallowCompare = Object.assign({}, mappedState);
  };
  const subscribe = () => {
    const newMappedState = stateMapper(store.getState());
    if (!_.isEqual(stateToShallowCompare, newMappedState)) {
      inject(newMappedState);
    }
  };
  const unsubscribe = store.subscribe(subscribe);
  const originalDetached = (viewModel.detached && viewModel.detached.bind(viewModel)) || (() => {});
  viewModel.detached = () => {
    originalDetached();
    unsubscribe();
  };

  inject(stateMapper(state));
};


export default connect;
export { configure };
