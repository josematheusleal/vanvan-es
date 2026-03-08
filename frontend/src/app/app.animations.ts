import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* => *', [
    style({ position: 'relative' }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' })
    ], { optional: true }),
    query(':leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 0
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-15px)' }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)', position: 'relative', zIndex: 1 }))
      ], { optional: true })
    ])
  ])
]);
