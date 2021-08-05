import { ReactChild, ReactChildren } from 'react';
import { provideStatefulCore } from '@yext/answers-headless';
import { AnswersConfig } from '@yext/answers-core';
import { AnswersActions, AnswersActionsContext } from './AnswersActionsContext';

interface Props extends AnswersConfig {
  children?: ReactChildren | ReactChild | (ReactChildren | ReactChild)[]
}

export function AnswersActionsProvider(props: Props): JSX.Element {
  const { children, ...answerConfig } = props;
  const answersActions: AnswersActions = provideStatefulCore(answerConfig);
  return (
    <AnswersActionsContext.Provider value={answersActions}>
      {children}
    </AnswersActionsContext.Provider>
  );
}