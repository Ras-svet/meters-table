import { types } from 'mobx-state-tree';

const Address = types.model('Address', {
  id: types.identifier,
  address: types.maybeNull(types.string),
  str_number: types.maybeNull(types.string),
  str_number_full: types.maybeNull(types.string),
  house: types.model({
    address: types.string,
  }),
});

export default Address;
