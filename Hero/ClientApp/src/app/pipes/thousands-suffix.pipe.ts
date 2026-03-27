import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousandSuffixes'
})
export class ThousandSuffixesPipe implements PipeTransform {

  transform(input: any): any {

    if (Number.isNaN(input)) {
      return null;
    }

    if (input < 1000) {
      return input;
    }
    if (input >= 1000000)
        return `${(input / 1000000).toFixed(1)}M`;
    else if (input >= 1000)
        `${(input / 1000).toFixed(1)}K`;
  }

}
