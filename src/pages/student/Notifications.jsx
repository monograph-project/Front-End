import UserNotificationInbox from "../../components/notifications/UserNotificationInbox";

export default function Notifications() {
  return (
    <div className=" w-full min-h-screen bg-white dark:bg-dark-app-secondary ">
      <UserNotificationInbox basePath="/student/notifications" />
    </div>
  );
}
