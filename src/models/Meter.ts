import { types } from 'mobx-state-tree';

const Meter = types.model('Meter', {
  id: types.identifier,
  _type: types.array(types.string),
  area: types.model({
    id: types.string, // Идентификатор как строка
  }),
  is_automatic: types.maybeNull(types.boolean),
  communication: types.maybeNull(types.string),
  description: types.maybeNull(types.string),
  serial_number: types.maybeNull(types.string),
  installation_date: types.maybeNull(types.string),
  brand_name: types.maybeNull(types.string),
  model_name: types.maybeNull(types.string),
  initial_values: types.array(types.number),
});

export default Meter;
