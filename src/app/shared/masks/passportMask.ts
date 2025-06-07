import {MaskitoOptions} from '@maskito/core';

export const passportSeriesMask: MaskitoOptions = {
  mask: [/\d/, /\d/, /\d/, /\d/],
};

export const passportNumberMask: MaskitoOptions = {
  mask: [/\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
}; 