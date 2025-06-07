import {MaskitoOptions} from '@maskito/core';

export const nameMask: MaskitoOptions = {
  mask: /^[а-яА-ЯёЁa-zA-Z\s]*$/,
  preprocessors: [
    ({elementState, data}) => {
      const {value, selection} = elementState;
      const newValue = value.slice(0, selection[0]) + data + value.slice(selection[1]);
      
      // Проверяем, что вводится только буква
      if (!/^[а-яА-ЯёЁa-zA-Z\s]*$/.test(newValue)) {
        return {
          elementState,
          data: '',
        };
      }
      
      return {
        elementState,
        data,
      };
    },
  ],
}; 