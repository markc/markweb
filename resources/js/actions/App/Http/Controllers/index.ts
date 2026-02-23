import FileLinkController from './FileLinkController'
import JmapAuthController from './JmapAuthController'
import JmapAttachmentController from './JmapAttachmentController'
import SystemEventController from './SystemEventController'
import OpenClawPushController from './OpenClawPushController'
import DashboardController from './DashboardController'
import ChatController from './ChatController'
import Agent from './Agent'
import SystemPromptTemplateController from './SystemPromptTemplateController'
import DocsController from './DocsController'
import UserController from './UserController'
import MailController from './MailController'
import SharedFileController from './SharedFileController'
import CalendarController from './CalendarController'
import EventController from './EventController'
import AddressBookController from './AddressBookController'
import ContactController from './ContactController'
import ShareController from './ShareController'
import Settings from './Settings'
import DavController from './DavController'

const Controllers = {
    FileLinkController: Object.assign(FileLinkController, FileLinkController),
    JmapAuthController: Object.assign(JmapAuthController, JmapAuthController),
    JmapAttachmentController: Object.assign(JmapAttachmentController, JmapAttachmentController),
    SystemEventController: Object.assign(SystemEventController, SystemEventController),
    OpenClawPushController: Object.assign(OpenClawPushController, OpenClawPushController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    ChatController: Object.assign(ChatController, ChatController),
    Agent: Object.assign(Agent, Agent),
    SystemPromptTemplateController: Object.assign(SystemPromptTemplateController, SystemPromptTemplateController),
    DocsController: Object.assign(DocsController, DocsController),
    UserController: Object.assign(UserController, UserController),
    MailController: Object.assign(MailController, MailController),
    SharedFileController: Object.assign(SharedFileController, SharedFileController),
    CalendarController: Object.assign(CalendarController, CalendarController),
    EventController: Object.assign(EventController, EventController),
    AddressBookController: Object.assign(AddressBookController, AddressBookController),
    ContactController: Object.assign(ContactController, ContactController),
    ShareController: Object.assign(ShareController, ShareController),
    Settings: Object.assign(Settings, Settings),
    DavController: Object.assign(DavController, DavController),
}

export default Controllers