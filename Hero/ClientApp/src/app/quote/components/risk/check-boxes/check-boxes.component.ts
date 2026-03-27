import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, ViewChild, ViewChildren } from '@angular/core';
import { NG_VALUE_ACCESSOR} from '@angular/forms';
import { MatSelect } from '@angular/material';
import { of, ReplaySubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { delay } from 'rxjs/internal/operators/delay';
import { takeUntil } from 'rxjs/operators';
import { RiskQuestionOption } from '../../../../models';
import { BaseRiskQuestionValueAccessor } from '../base-risk-question/base-risk-question-value-accessor.component';

/** @title Select with custom trigger text */
@Component({
    selector: 'check-boxes',
    templateUrl: 'check-boxes.component.html',
    styleUrls: ['check-boxes.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckBoxesComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckBoxesComponent extends BaseRiskQuestionValueAccessor<RiskQuestionOption[]> {
    private readonly _destroyed$ = new ReplaySubject<void>(1);
    private delayInterval: Observable<any[]>;

    constructor() {
        super();
        this.initialise();
    }

    onChangeCategory(event) {
        let initalLayoutHeight = document.body.scrollHeight;
        this.onChangeEvent(event.value);

        this.delayInterval.subscribe(() => {
            this.repositionWhenLayoutChange(initalLayoutHeight);
        }, (err) => console.log(err)
         , () => { });
    }

    private repositionWhenLayoutChange(initalLayoutHeight: number = 0) {
        if (initalLayoutHeight < document.body.scrollHeight) {
            window.scrollTo(0, document.body.scrollHeight);
        }
    }

    private initialise() {
        const delay$ = of([]);
        this.delayInterval = delay$.pipe(
            takeUntil(this._destroyed$),
            delay(0)
        );
    }

    compare(optionFirst: RiskQuestionOption, optionSecond: RiskQuestionOption) {
        return optionFirst && optionSecond && optionFirst.uid === optionSecond.uid;
    }

    ngAfterViewInit() {
        this.repositionWhenLayoutChange();
    }

    handleDestroy() {
        super.handleDestroy();
        this._destroyed$.next();
        this._destroyed$.complete();
    }
}
