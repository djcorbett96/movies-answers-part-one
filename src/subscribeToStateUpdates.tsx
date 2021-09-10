// TODO(SLAP-1485): find out how to specify generic component props without using `any`
// I sank a 3-4 hours into this but couldn't figure out exactly how to get it to work.
// May require use of typescript generics.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType, useReducer, useEffect, useContext } from 'react';
import { State } from '@yext/answers-headless/lib/esm/models/state';
import { AnswersActionsContext } from './AnswersActionsContext';
import isShallowEqual from './utils/isShallowEqual';

type SubscriberGenerator = (WrappedComponent: ComponentType<any>) => (props: any) => JSX.Element;

/**
 * Generates a HOC that updates a given Component's props based on the current
 * answers-headless state and a given mapping function.
 */
export function subscribeToStateUpdates(mapStateToProps: (s: State) => Record<string, unknown>): SubscriberGenerator {
  const generateSubscriberHOC: SubscriberGenerator = WrappedComponent => {
    // Keep manual track of the props mapped from state instead of storing it in the StatefulCoreSubscriber's state.
    // This avoids react's batching of state updates, which can result in mappedState not updating immediately.
    // This can, in turn, result in extra stateful-core listener invocations.
    let previousPropsFromState = {};
    return function StatefulCoreSubscriber(props: Record<string, unknown>) {
      const statefulCore = useContext(AnswersActionsContext);
      const [mergedProps, dispatch] = useReducer(() => {
        return {
          ...props,
          ...previousPropsFromState
        };
      }, { ...props, ...mapStateToProps(statefulCore.state) });

      useEffect(() => {
        return statefulCore.addListener({
          valueAccessor: (state: State) => mapStateToProps(state),
          callback: newPropsFromState => {
            if (!isShallowEqual(previousPropsFromState, newPropsFromState)) {
              previousPropsFromState = newPropsFromState;
              dispatch();
            }
          }
        });
      });
      return <WrappedComponent {...mergedProps}/>;
    };
  };
  return generateSubscriberHOC;
}
