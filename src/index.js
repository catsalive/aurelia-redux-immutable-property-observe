import * as _ from 'lodash';

let store;

const configure = (aurelia, storeInstance) => {
  if (!storeInstance || typeof(storeInstance) !== 'object') {
    console.error('You need to pass a store to aurelia-redux-immutable configurator function.');
    return;
  }

  store = aurelia.container.get(storeInstance);
};

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
