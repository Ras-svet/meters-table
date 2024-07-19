import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocalObservable } from 'mobx-react-lite';
import { format } from 'date-fns';
import MeterStore from '../../stores/MeterStore';
import './Table.css';
import cold from '../../images/cold_water.svg';
import hot from '../../images/hot_water.svg';

const Table: React.FC = observer(() => {
  const store = useLocalObservable(() => MeterStore.create());

  useEffect(() => {
    store.fetchMeters();
  }, [store.page]);

  // Функция для генерации массива номеров страниц
  const getPageNumbers = () => {
    const totalPages = store.totalPages;
    const pages: (number | string)[] = [];

    // Добавляем первую страницу всегда
    pages.push(0);

    // Добавляем вторую и третью страницы, если они существуют
    if (totalPages > 1) pages.push(1);
    if (totalPages > 2) pages.push(2);

    // Добавляем многоточие, если текущая страница далеко от первых трех страниц
    if (store.page > 3) {
      pages.push('...');
    }

    // Добавляем страницы вокруг текущей страницы
    const startPage = Math.max(3, store.page - 1);
    const endPage = Math.min(totalPages - 2, store.page + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Добавляем многоточие, если текущая страница далеко от последних трех страниц
    if (store.page < totalPages - 4) {
      pages.push('...');
    }

    // Добавляем последние три страницы
    for (let i = totalPages - 3; i < totalPages; i++) {
      if (i >= 3 && i !== store.page && i !== store.page + 1) {
        pages.push(i);
      }
    }

    return pages;
  };

  const handleDelete = async (meterId: string) => {
    try {
      await store.deleteMeter(meterId);
      store.fetchMeters(); // Перезагрузите список после удаления
    } catch (error) {
      console.error('Error deleting meter:', error);
    }
  };
  const pageNumbers = getPageNumbers();
  console.log(store.paginatedMeters);

  return (
    <>
      <section className="table">
        <table className="table__container">
          <thead>
            <tr>
              <th>№</th>
              <th>Тип</th>
              <th>Дата установки</th>
              <th>Автоматический</th>
              <th>Текущие показания</th>
              <th>Адрес</th>
              <th>Примечание</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {store.loading ? (
              <tr>
                <td colSpan={7}>Loading...</td>
              </tr>
            ) : (
              store.paginatedMeters.map((meter, index) => (
                <tr key={meter.id}>
                  <td>{store.page * 20 + index + 1}</td>
                  <td className="type">
                    <img
                      className="icon"
                      src={
                        meter._type.includes('ColdWaterAreaMeter') ? cold : hot
                      }
                      alt={
                        meter._type.includes('ColdWaterAreaMeter')
                          ? 'Холодная вода'
                          : 'Горячая вода'
                      }
                    />
                    {meter._type.includes('ColdWaterAreaMeter') ? 'ХВС' : 'ГВС'}
                  </td>
                  <td>
                    {meter.installation_date
                      ? format(new Date(meter.installation_date), 'dd.MM.yyyy')
                      : 'Неизвестно'}
                  </td>
                  <td>{meter.is_automatic ? 'Да' : 'Нет'}</td>
                  <td>{meter.initial_values.join(', ')}</td>
                  <td>{store.getAddress(meter.area.id)}</td>
                  <td>{meter.description}</td>
                  <button
                    className="item__button"
                    onClick={() => handleDelete(meter.id)}
                  ></button>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <div className="pagination">
        {pageNumbers.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              className={`pagination__button ${store.page === page ? 'active' : ''}`}
              onClick={() => store.setPage(page)}
            >
              {page + 1}
            </button>
          ) : (
            <span key={index} className="pagination__ellipsis">
              ...
            </span>
          )
        )}
      </div>
    </>
  );
});

export default Table;
