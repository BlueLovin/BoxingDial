from django.urls import path
from . import views as inbox_views

urlpatterns = [
    path("api/inbox/", inbox_views.InboxView.as_view()),
    path(
        "api/inbox/<int:notification>/read",
        inbox_views.MarkNotificationAsReadView.as_view(),
    ),
    path(
        "api/inbox/<int:notification>/delete",
        inbox_views.DeleteNotificationView.as_view(),
    ),
    path(
        "api/inbox/clear",
        inbox_views.DeleteAllNotificationsView.as_view(),
    ),
    path(
        "api/inbox/read-all",
        inbox_views.MarkAllAsReadView.as_view(),
    ),
]
