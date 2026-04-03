from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import RegisterView, LoginView, MeView
from journal.views import JournalEntryViewSet
from chat.views import ChatSessionViewSet, SendMessageView
from dashboard.views import MoodStatsView, MoodTrendView, InsightView
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'journal/entries', JournalEntryViewSet, basename='journal-entry')
router.register(r'chat/sessions', ChatSessionViewSet, basename='chat-session')

api_patterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('dashboard/stats/', MoodStatsView.as_view(), name='mood-stats'),
    path('dashboard/trend/', MoodTrendView.as_view(), name='mood-trend'),
    path('dashboard/insight/', InsightView.as_view(), name='insight'),
    
    path('journal/analyze/', JournalEntryViewSet.as_view({'post': 'analyze'}), name='journal-analyze'),
    path('chat/message/', SendMessageView.as_view(), name='send-message'),
    path('', include(router.urls)),
]

urlpatterns = [
    path('api/', include(api_patterns)),
]
