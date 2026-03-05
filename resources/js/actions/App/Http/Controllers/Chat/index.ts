import ChatChannelController from './ChatChannelController'
import ChatMessageController from './ChatMessageController'

const Chat = {
    ChatChannelController: Object.assign(ChatChannelController, ChatChannelController),
    ChatMessageController: Object.assign(ChatMessageController, ChatMessageController),
}

export default Chat