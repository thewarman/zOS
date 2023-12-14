import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import { normalize } from '../../../store/channels-list';
import { normalize as normalizeUsers } from '../../../store/users';
import { RootState } from '../../../store/reducer';
import moment from 'moment';
import { when } from 'jest-when';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';
import { GroupDetailsPanel } from './group-details-panel';
import { Stage } from '../../../store/create-conversation';
import { Stage as GroupManagementStage } from '../../../store/group-management';
import { RegistrationState } from '../../../store/registration';
import { LayoutState } from '../../../store/layout/types';
import { previewDisplayDate } from '../../../lib/chat/chat-message';
import { SettingsMenu } from '../../settings-menu';
import { GroupManagementContainer } from './group-management/container';

const mockSearchMyNetworksByName = jest.fn();
jest.mock('../../../platform-apps/channels/util/api', () => {
  return { searchMyNetworksByName: async (...args) => await mockSearchMyNetworksByName(...args) };
});

describe('messenger-list', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      stage: Stage.None,
      groupManangemenetStage: GroupManagementStage.None,
      groupUsers: [],
      conversations: [],
      isFetchingExistingConversations: false,
      isFirstTimeLogin: false,
      includeTitleBar: true,
      allowClose: true,
      allowExpand: true,
      isMessengerFullScreen: false,
      includeUserSettings: false,
      userName: '',
      userHandle: '',
      userAvatarUrl: '',
      isInviteNotificationOpen: false,
      myUserId: '',
      onConversationClick: jest.fn(),
      createConversation: jest.fn(),
      startCreateConversation: () => null,
      membersSelected: () => null,
      startGroup: () => null,
      back: () => null,
      enterFullScreenMessenger: () => null,
      receiveSearchResults: () => null,
      logout: () => null,

      ...props,
    };

    return shallow(<DirectMessageChat {...allProps} />);
  };

  it('render direct message members', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members').exists()).toBe(true);
  });

  it('starts create conversation saga', async function () {
    const startCreateConversation = jest.fn();
    const wrapper = subject({ startCreateConversation });

    wrapper.find(ConversationListPanel).prop('startConversation')();

    expect(startCreateConversation).toHaveBeenCalledOnce();
  });

  it('renders SettingsMenu when stage is equal to none and messenger is fullscreen', function () {
    const wrapper = subject({ stage: Stage.None, includeUserSettings: true, isMessengerFullScreen: true });

    expect(wrapper).toHaveElement(SettingsMenu);
  });

  it('does not render SettingsMenu when stage is equal to none and messenger is not fullscreen', function () {
    const wrapper = subject({ stage: Stage.None, isMessengerFullScreen: false });

    expect(wrapper).not.toHaveElement(SettingsMenu);
  });

  it('does not render SettingsMenu when stage is not equal to none', function () {
    const wrapper = subject({ stage: Stage.CreateOneOnOne });

    expect(wrapper).not.toHaveElement(SettingsMenu);
  });

  it('renders users name when stage is equal to none', function () {
    const wrapper = subject({ stage: Stage.None, userName: 'Joe Bloggs' });

    expect(wrapper.find('.messenger-list__user-name').text()).toEqual('Joe Bloggs');
  });

  it('does not render users name when stage is not equal to none', function () {
    const wrapper = subject({ stage: Stage.CreateOneOnOne, userName: 'Joe Bloggs' });

    expect(wrapper).not.toHaveElement('.messenger-list__user-name');
  });

  it('renders CreateConversationPanel', function () {
    const wrapper = subject({ stage: Stage.CreateOneOnOne });

    expect(wrapper).not.toHaveElement(ConversationListPanel);
    expect(wrapper).toHaveElement(CreateConversationPanel);
    expect(wrapper).not.toHaveElement(StartGroupPanel);
    expect(wrapper).not.toHaveElement(GroupDetailsPanel);
  });

  it('renders StartGroupPanel', function () {
    const wrapper = subject({ stage: Stage.StartGroupChat });

    expect(wrapper).not.toHaveElement(ConversationListPanel);
    expect(wrapper).not.toHaveElement(CreateConversationPanel);
    expect(wrapper).toHaveElement(StartGroupPanel);
    expect(wrapper).not.toHaveElement(GroupDetailsPanel);
  });

  it('renders GroupDetailsPanel', function () {
    const wrapper = subject({ stage: Stage.GroupDetails });

    expect(wrapper).not.toHaveElement(ConversationListPanel);
    expect(wrapper).not.toHaveElement(CreateConversationPanel);
    expect(wrapper).not.toHaveElement(StartGroupPanel);
    expect(wrapper).toHaveElement(GroupDetailsPanel);
  });

  it('moves starts group when group chat started', async function () {
    const startGroup = jest.fn();
    const wrapper = subject({ stage: Stage.CreateOneOnOne, startGroup });

    wrapper.find(CreateConversationPanel).simulate('startGroupChat');

    expect(startGroup).toHaveBeenCalledOnce();
  });

  it('moves back from CreateConversationPanel', async function () {
    const back = jest.fn();
    const wrapper = subject({ stage: Stage.CreateOneOnOne, back });

    await wrapper.find(CreateConversationPanel).simulate('back');

    expect(back).toHaveBeenCalledOnce();
  });

  it('moves back from StartGroupPanel', async function () {
    const back = jest.fn();
    const wrapper = subject({ stage: Stage.StartGroupChat, back });

    await wrapper.find(StartGroupPanel).simulate('back');

    expect(back).toHaveBeenCalledOnce();
  });

  it('moves back from GroupDetailsPanel', async function () {
    const back = jest.fn();
    const wrapper = subject({ stage: Stage.GroupDetails, back });

    await wrapper.find(GroupDetailsPanel).simulate('back');

    expect(back).toHaveBeenCalledOnce();
  });

  it('searches for citizens when creating a new conversation', async function () {
    when(mockSearchMyNetworksByName)
      .calledWith('jac')
      .mockResolvedValue([{ id: 'user-id', profileImage: 'image-url' }]);
    const wrapper = subject({ stage: Stage.CreateOneOnOne });

    const searchResults = await wrapper.find(CreateConversationPanel).prop('search')('jac');

    expect(searchResults).toStrictEqual([{ id: 'user-id', image: 'image-url', profileImage: 'image-url' }]);
  });

  it('creates a one on one conversation when user selected', async function () {
    const createConversation = jest.fn();
    const wrapper = subject({ createConversation, stage: Stage.CreateOneOnOne });

    wrapper.find(CreateConversationPanel).prop('onCreate')('selected-user-id');

    expect(createConversation).toHaveBeenCalledWith({ userIds: ['selected-user-id'] });
  });

  it('doest NOT create a one on one conversation if there is already a conversation with user', async function () {
    const createConversation = jest.fn();
    const wrapper = subject({
      createConversation,
      stage: Stage.CreateOneOnOne,
      conversations: [{ id: 'convo-id', isOneOnOne: true, otherMembers: [{ userId: 'selected-user-id' }] }] as any,
    });

    wrapper.find(CreateConversationPanel).prop('onCreate')('selected-user-id');
    expect(createConversation).not.toHaveBeenCalled();
  });

  it('opens the existing conversation if there is already a conversation with user', async function () {
    const onConversationClick = jest.fn();
    const wrapper = subject({
      onConversationClick,
      stage: Stage.CreateOneOnOne,
      conversations: [{ id: 'convo-id', isOneOnOne: true, otherMembers: [{ userId: 'selected-user-id' }] }] as any,
    });

    wrapper.find(CreateConversationPanel).prop('onCreate')('selected-user-id');
    expect(onConversationClick).toHaveBeenCalledWith({ conversationId: 'convo-id' });
  });

  it('does not open the existing conversation if there is already a conversation with user BUT the conversation is a group (and not one2one)', async function () {
    const onConversationClick = jest.fn();
    const wrapper = subject({
      onConversationClick,
      stage: Stage.CreateOneOnOne,
      conversations: [
        {
          id: 'convo-id',
          otherMembers: [
            { userId: 'selected-user-id' },
            { userId: 'another-user-id' },
          ],
          isOneOnOne: false,
        },
      ] as any,
    });

    wrapper.find(CreateConversationPanel).prop('onCreate')('selected-user-id');
    expect(onConversationClick).not.toHaveBeenCalled();
  });

  it('returns to conversation list if back button pressed', async function () {
    const back = jest.fn();
    const wrapper = subject({ stage: Stage.CreateOneOnOne, back });

    wrapper.find(CreateConversationPanel).prop('onBack')();

    expect(back).toHaveBeenCalledOnce();
  });

  it('sets StartGroupPanel to Continuing while data is loading', async function () {
    const wrapper = subject({ stage: Stage.StartGroupChat, isFetchingExistingConversations: true });

    expect(wrapper.find(StartGroupPanel).prop('isContinuing')).toBeTrue();
  });

  it('creates a group conversation when details submitted', async function () {
    const createConversation = jest.fn();
    const wrapper = subject({ createConversation, stage: Stage.StartGroupChat });
    await wrapper.find(StartGroupPanel).prop('onContinue')([{ value: 'id-1' } as any]);
    wrapper.setProps({ stage: Stage.GroupDetails });

    wrapper
      .find(GroupDetailsPanel)
      .simulate('create', { name: 'group name', users: [{ value: 'id-1' }], image: { some: 'image' } });

    expect(createConversation).toHaveBeenCalledWith({
      name: 'group name',
      userIds: ['id-1'],
      image: { some: 'image' },
    });
  });

  it('sets the start group props', async function () {
    const wrapper = subject({ stage: Stage.StartGroupChat, groupUsers: [{ value: 'user-id' } as any] });

    expect(wrapper.find(StartGroupPanel).prop('initialSelections')).toEqual([{ value: 'user-id' }]);
  });

  it('renders GroupManagement if group management stage is NOT none', function () {
    const wrapper = subject({ stage: Stage.None, groupManangemenetStage: GroupManagementStage.StartAddMemberToRoom });

    expect(wrapper).toHaveElement(GroupManagementContainer);
  });

  it('does not render GroupManagement if group management stage is none', function () {
    const wrapper = subject({ stage: Stage.None, groupManangemenetStage: GroupManagementStage.None });

    expect(wrapper).not.toHaveElement(GroupManagementContainer);
  });

  describe('mapState', () => {
    const subject = (
      channels,
      createConversationState = {},
      currentUser = [{ userId: '', firstName: '', isAMemberOfWorlds: true }],
      chat = { activeConversationId: '' }
    ) => {
      return DirectMessageChat.mapState(getState(channels, createConversationState, currentUser, chat));
    };

    const getState = (
      channels,
      createConversationState = {},
      users = [{ userId: '', isAMemberOfWorlds: true }],
      chat = { activeConversationId: '' }
    ) => {
      const channelData = normalize(channels);
      const userData = normalizeUsers(users);
      return {
        authentication: {
          user: {
            data: {
              id: users[0].userId,
              isAMemberOfWorlds: users[0].isAMemberOfWorlds,
            },
          },
        },
        chat,
        channelsList: { value: channelData.result },
        normalized: {
          ...userData.entities,
          ...channelData.entities,
        } as any,
        createConversation: {
          startGroupChat: {},
          groupDetails: {},
          ...createConversationState,
        },
        registration: {},
        groupManagement: {},
      } as RootState;
    };

    test('gets sorted conversations', () => {
      const state = subject([
        { id: 'convo-1', lastMessage: { createdAt: moment('2023-03-03').valueOf(), sender: {} }, isChannel: false },
        { id: 'convo-2', lastMessage: { createdAt: moment('2023-03-01').valueOf(), sender: {} }, isChannel: false },
        { id: 'convo-3', createdAt: moment('2023-03-04').valueOf(), isChannel: false },
        {
          id: 'convo-4',
          createdAt: moment('2023-03-05').valueOf(),
          lastMessage: { createdAt: moment('2023-03-02').valueOf(), sender: {} },
          isChannel: false,
        },
      ]);

      expect(state.conversations.map((c) => c.id)).toEqual([
        'convo-3',
        'convo-1',
        'convo-4',
        'convo-2',
      ]);
    });

    test('gets only conversations', () => {
      const state = subject([
        { id: 'convo-1', isChannel: false },
        { id: 'convo-2', isChannel: true },
        { id: 'convo-3', isChannel: false },
      ]);

      expect(state.conversations.map((c) => c.id)).toEqual([
        'convo-1',
        'convo-3',
      ]);
    });

    describe('messagePreview', () => {
      it('sets the preview for all conversations', () => {
        const state = subject([
          {
            id: 'convo-1',
            lastMessage: { message: 'The last message', sender: { firstName: 'Jack' } },
            isChannel: false,
          },
          {
            id: 'convo-2',
            lastMessage: { message: 'Second message last', sender: { firstName: 'Jack' } },
            isChannel: false,
          },
        ]);

        expect(state.conversations.map((c) => c.messagePreview)).toEqual([
          'Jack: The last message',
          'Jack: Second message last',
        ]);
      });

      it('uses most recent of last message in list or lastMessage on conversation', () => {
        const state = subject([
          {
            id: 'convo-1',
            lastMessage: { message: 'lastMessage', createdAt: 10003, sender: { firstName: 'Jack' } },
            messages: [
              { id: '1', message: 'recent message', createdAt: 10005, sender: { firstName: 'Jack' } },
              { id: '2', message: 'old message', createdAt: 10002 },
            ],
            isChannel: false,
          },
          {
            id: 'convo-2',
            lastMessage: { message: 'lastMessage', createdAt: 20007, sender: { firstName: 'Jack' } },
            messages: [],
            isChannel: false,
          },
        ]);

        expect(state.conversations.map((c) => c.messagePreview)).toEqual([
          'Jack: lastMessage',
          'Jack: recent message',
        ]);
      });
    });

    test('previewDisplayDate', () => {
      const date = moment('2023-03-03').valueOf();
      const state = subject([
        {
          id: 'convo-1',
          lastMessage: { createdAt: date, message: '', sender: {} },
          isChannel: false,
        },
      ]);

      expect(state.conversations.map((c) => c.previewDisplayDate)).toEqual([previewDisplayDate(date)]);
    });

    test('activeConversationId', () => {
      const state = subject([], {}, undefined, { activeConversationId: 'active-channel-id' });

      expect(state.activeConversationId).toEqual('active-channel-id');
    });

    test('stage', () => {
      const state = subject([], { stage: Stage.GroupDetails });

      expect(state.stage).toEqual(Stage.GroupDetails);
    });

    test('groupUsers', () => {
      const state = subject([], { groupUsers: [{ value: 'a-thing' }] });

      expect(state.groupUsers).toEqual([{ value: 'a-thing' }]);
    });

    test('start group chat', () => {
      const state = subject([], {
        startGroupChat: {
          isLoading: true,
        },
      });

      expect(state.isFetchingExistingConversations).toEqual(true);
    });

    test('isFirstTimeLogin', async () => {
      const state = DirectMessageChat.mapState({
        ...getState([]),
        registration: { isFirstTimeLogin: true } as RegistrationState,
      });

      expect(state.isFirstTimeLogin).toEqual(true);
    });

    test('includeTitleBar', async () => {
      let state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: true } } as LayoutState,
      });
      expect(state.includeTitleBar).toEqual(false);

      state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: false } } as LayoutState,
      });
      expect(state.includeTitleBar).toEqual(true);
    });

    test('allowClose', async () => {
      let state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: true } } as LayoutState,
      });
      expect(state.allowClose).toEqual(false);

      state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: false } } as LayoutState,
      });
      expect(state.allowClose).toEqual(true);
    });

    test('allowExpand', async () => {
      let state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: true } } as LayoutState,
      });
      expect(state.allowExpand).toEqual(false);

      state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: false } } as LayoutState,
      });
      expect(state.allowExpand).toEqual(true);
    });

    test('includeUserSettings', async () => {
      let state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: true } } as LayoutState,
      });
      expect(state.includeUserSettings).toEqual(true);

      state = DirectMessageChat.mapState({
        ...getState([]),
        layout: { value: { isMessengerFullScreen: false } } as LayoutState,
      });
      expect(state.includeUserSettings).toEqual(false);
    });
  });
});
