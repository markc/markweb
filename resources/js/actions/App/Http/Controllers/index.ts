import FileLinkController from './FileLinkController'
import SearchController from './SearchController'
import JmapAuthController from './JmapAuthController'
import JmapAttachmentController from './JmapAttachmentController'
import AppMeshController from './AppMeshController'
import SystemEventController from './SystemEventController'
import OpenClawPushController from './OpenClawPushController'
import MeshInboundController from './MeshInboundController'
import MeshController from './MeshController'
import MeshTaskController from './MeshTaskController'
import DashboardController from './DashboardController'
import Agent from './Agent'
import SharedChatController from './SharedChatController'
import ChatController from './ChatController'
import SystemPromptTemplateController from './SystemPromptTemplateController'
import AgentController from './AgentController'
import DocsController from './DocsController'
import UserController from './UserController'
import MailController from './MailController'
import SharedFileController from './SharedFileController'
import CalendarController from './CalendarController'
import EventController from './EventController'
import AddressBookController from './AddressBookController'
import ContactController from './ContactController'
import Chat from './Chat'
import AgentCardController from './AgentCardController'
import ShareController from './ShareController'
import Settings from './Settings'
import DavController from './DavController'

const Controllers = {
    FileLinkController: Object.assign(FileLinkController, FileLinkController),
    SearchController: Object.assign(SearchController, SearchController),
    JmapAuthController: Object.assign(JmapAuthController, JmapAuthController),
    JmapAttachmentController: Object.assign(JmapAttachmentController, JmapAttachmentController),
    AppMeshController: Object.assign(AppMeshController, AppMeshController),
    SystemEventController: Object.assign(SystemEventController, SystemEventController),
    OpenClawPushController: Object.assign(OpenClawPushController, OpenClawPushController),
    MeshInboundController: Object.assign(MeshInboundController, MeshInboundController),
    MeshController: Object.assign(MeshController, MeshController),
    MeshTaskController: Object.assign(MeshTaskController, MeshTaskController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    Agent: Object.assign(Agent, Agent),
    SharedChatController: Object.assign(SharedChatController, SharedChatController),
    ChatController: Object.assign(ChatController, ChatController),
    SystemPromptTemplateController: Object.assign(SystemPromptTemplateController, SystemPromptTemplateController),
    AgentController: Object.assign(AgentController, AgentController),
    DocsController: Object.assign(DocsController, DocsController),
    UserController: Object.assign(UserController, UserController),
    MailController: Object.assign(MailController, MailController),
    SharedFileController: Object.assign(SharedFileController, SharedFileController),
    CalendarController: Object.assign(CalendarController, CalendarController),
    EventController: Object.assign(EventController, EventController),
    AddressBookController: Object.assign(AddressBookController, AddressBookController),
    ContactController: Object.assign(ContactController, ContactController),
    Chat: Object.assign(Chat, Chat),
    AgentCardController: Object.assign(AgentCardController, AgentCardController),
    ShareController: Object.assign(ShareController, ShareController),
    Settings: Object.assign(Settings, Settings),
    DavController: Object.assign(DavController, DavController),
}

export default Controllers