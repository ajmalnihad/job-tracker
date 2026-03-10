from django.urls import path
from . import views

urlpatterns = [
    # നിന്റെ നിലവിലെ മറ്റ് URL-കൾ ഇവിടെ ഉണ്ടാകും...
    
    path('api/interview/start/', views.start_interview, name='start_interview'),
    path('api/interview/chat/', views.chat_interview, name='chat_interview'),
]