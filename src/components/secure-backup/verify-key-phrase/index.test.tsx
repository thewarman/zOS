import { shallow } from 'enzyme';

import { VerifyKeyPhrase, Properties } from '.';
import { buttonLabelled, pressButton } from '../../../test/utils';

import { Alert, Input } from '@zero-tech/zui/components';

import { bem } from '../../../lib/bem';
const c = bem('.secure-backup');

describe(VerifyKeyPhrase, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      errorMessage: '',
      onBack: () => null,
      onSubmit: () => null,
      ...props,
    };

    return shallow(<VerifyKeyPhrase {...allProps} />);
  };

  it('publishes onBack when the back button is pressed', function () {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    pressButton(wrapper, 'Back to phrase');

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('publishes onSubmit with the key phrase when the verify button is pressed', function () {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });

    wrapper.find(Input).simulate('change', 'test-key-phrase');

    pressButton(wrapper, 'Verify and complete backup');

    expect(onSubmit).toHaveBeenCalledWith('test-key-phrase');
  });

  it('disables the verify button when recovery key is empty', function () {
    const wrapper = subject();

    expect(buttonLabelled(wrapper, 'Verify and complete backup')).toHaveProp('isDisabled', true);
  });

  it('enables the verify button when a key phrase is entered', function () {
    const wrapper = subject();

    wrapper.find(Input).simulate('change', 'test-key-phrase');

    expect(buttonLabelled(wrapper, 'Verify and complete backup')).toHaveProp('isDisabled', false);
  });

  it('renders Alert when errorMessage is provided', function () {
    const wrapper = subject({ errorMessage: 'Invalid key prhase' });

    expect(wrapper).toHaveElement(Alert);
  });

  it('does not render Alert when errorMessage is not provided', function () {
    const wrapper = subject({ errorMessage: '' });

    expect(wrapper).not.toHaveElement(Alert);
  });

  it('applies the error class to Input when error message exists', function () {
    const wrapper = subject({ errorMessage: 'Invalid key prhase' });

    expect(wrapper.find(c('input--error'))).toExist();
  });

  it('does not apply the error class to Input when error message does not exist', function () {
    const wrapper = subject({ errorMessage: '' });

    expect(wrapper.find(c('input--error'))).not.toExist();
  });
});