import { shallow } from 'enzyme';
import { OverviewPanel, Properties } from '.';
import { PanelHeader } from '../../list/panel-header';
import { CitizenListItem } from '../../../citizen-list-item';
import { User } from '../../../../store/channels';
import { bem } from '../../../../lib/bem';

import { stubUser } from '../../../../store/test/store';

const c = bem('.message-info-overview-panel');

describe(OverviewPanel, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      readBy: [],
      sentTo: [],
      message: '',
      messageCreatedAt: '',

      closeMessageInfo: () => {},
      ...props,
    };

    return shallow(<OverviewPanel {...allProps} />);
  };

  it('calls closeMessageInfo on PanelHeader back event', () => {
    const closeMessageInfo = jest.fn();
    const wrapper = subject({ closeMessageInfo });

    wrapper.find(PanelHeader).simulate('back');

    expect(closeMessageInfo).toHaveBeenCalled();
  });

  it('renders readBy section', () => {
    const readBy: User[] = [stubUser({ userId: '1' })];
    const wrapper = subject({ readBy });

    expect(wrapper.find(c('section'))).toHaveLength(1);
    expect(wrapper.find(c('section-title')).at(0)).toHaveText('Read By');
    expect(wrapper.find(CitizenListItem)).toHaveLength(1);
  });

  it('does not render readBy section if readBy is empty', () => {
    const sentTo: User[] = [stubUser({ userId: '1' })];
    const wrapper = subject({ readBy: [], sentTo });

    expect(wrapper.find(c('section'))).toHaveLength(1);
    expect(wrapper.find(c('section-title')).at(0)).toHaveText('Sent To');
  });

  it('renders sentTo section', () => {
    const sentTo: User[] = [stubUser({ userId: '1' })];
    const wrapper = subject({ sentTo });

    expect(wrapper.find(c('section'))).toHaveLength(1);
    expect(wrapper.find(c('section-title')).at(0)).toHaveText('Sent To');
    expect(wrapper.find(CitizenListItem)).toHaveLength(1);
  });

  it('does not render sentTo section if sentTo is empty', () => {
    const readBy: User[] = [stubUser({ userId: '1' })];
    const wrapper = subject({ readBy, sentTo: [] });

    expect(wrapper.find(c('section'))).toHaveLength(1);
    expect(wrapper.find(c('section-title')).at(0)).toHaveText('Read By');
  });

  it('renders message if message is not empty', () => {
    const message = 'Test message';
    const wrapper = subject({ message });

    expect(wrapper.find(c('message-content-container'))).toExist();
  });

  it('does not render message if message is empty', () => {
    const wrapper = subject({ message: '' });

    expect(wrapper.find(c('message-content-container'))).not.toExist();
  });
});
