import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'valueArray',
})
export class ValueArrayPipe implements PipeTransform {

    public transform(objects: any = []) {
        return Object.keys(objects).map(key => { this.addKeyToObj(objects[key], key); return objects[key]} );
    }


    private addKeyToObj(obj: any =[], propKey:any) {
        if (!obj.hasOwnProperty(propKey))
            obj.key = propKey;
    }

}