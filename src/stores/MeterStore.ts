import { types, flow, applySnapshot, getSnapshot } from 'mobx-state-tree';
import axios from 'axios';
import Meter from '../models/Meter';
import Address from '../models/Address';

interface MeterData {
  id: string;
  _type: string[];
  area: {
    id: string;
  };
  is_automatic: boolean | null;
  communication: string | null;
  description: string | null;
  serial_number: string | null;
  installation_date: string | null;
  brand_name: string | null;
  model_name: string | null;
  initial_values: number[];
}

const MeterStore = types
  .model('MeterStore', {
    meters: types.array(Meter),
    addresses: types.map(Address),
    page: types.optional(types.number, 0),
    totalCount: types.optional(types.number, 0),
    totalPages: types.optional(types.number, 0),
    loading: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get paginatedMeters() {
      return self.meters.slice(self.page * 20, (self.page + 1) * 20);
    },
    getAddress(id: string) {
      const address = self.addresses.get(id);
      return address
        ? `${address.house.address || 'No Address'}. кв. ${address.str_number}`
        : 'Loading...';
    },
  }))
  .actions((self) => {
    // Функция для получения счетчиков
    const fetchMeters = flow(function* fetchMeters() {
      self.loading = true;
      try {
        const response = yield axios.get(
          'http://showroom.eis24.me/api/v4/test/meters/',
          {
            params: {
              limit: 20,
              offset: self.page * 20,
            },
          }
        );

        const metersData: MeterData[] = response.data.results;
        const totalCount: number = response.data.count;
        console.log(metersData);

        const meters = metersData.map((meter: MeterData) => ({
          id: meter.id,
          _type: meter._type,
          area: {
            id: meter.area.id,
          },
          is_automatic: meter.is_automatic,
          communication: meter.communication,
          description: meter.description,
          serial_number: meter.serial_number,
          installation_date: meter.installation_date,
          brand_name: meter.brand_name,
          model_name: meter.model_name,
          initial_values: meter.initial_values,
        }));

        applySnapshot(self.meters, [...self.meters, ...meters]);
        self.totalCount = totalCount;
        self.totalPages = Math.ceil(totalCount / 20);

        // Сбор уникальных идентификаторов адресов, которые нужно запросить
        const addressIds = meters
          .map((meter) => meter.area.id)
          .filter(
            (id, index, array) =>
              array.indexOf(id) === index && !self.addresses.has(id)
          );

        if (addressIds.length > 0) {
          // Запрос информации об адресах по каждому уникальному идентификатору
          for (const id of addressIds) {
            yield fetchAddress(id);
          }
        }
      } catch (error) {
        console.error('Error fetching meters:', error);
      }
      self.loading = false;
    });

    // Функция для получения информации об одном адресе по ID
    const fetchAddress = flow(function* fetchAddress(id: string) {
      try {
        const response = yield axios.get(
          'http://showroom.eis24.me/api/v4/test/areas/',
          {
            params: { id },
          }
        );

        const addressData = response.data.results[0];

        if (addressData) {
          const address = {
            id: addressData.id,
            address: addressData.address || '',
            str_number: addressData.str_number || '',
            str_number_full: addressData.str_number_full || '',
            house: {
              address: addressData.house.address || '',
            },
          };

          self.addresses.put(address);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    });

    const deleteMeter = flow(function* deleteMeter(meterId: string) {
      try {
        yield axios.delete(
          `http://showroom.eis24.me/api/v4/test/meters/${meterId}/`
        );
        const updatedMeters = self.meters
          .filter((meter) => meter.id !== meterId)
          .map((meter) => getSnapshot(meter));
        applySnapshot(self.meters, updatedMeters);
        // Запрос на получение новых счетчиков, чтобы всегда отображалось 20 элементов
        yield fetchMeters();
      } catch (error) {
        console.error('Error deleting meter:', error);
      }
    });

    // Функция для установки страницы
    const setPage = (page: number) => {
      self.page = page;
    };

    return { fetchMeters, fetchAddress, setPage, deleteMeter };
  });

export default MeterStore;
