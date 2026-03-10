import uuid
from django.core.cache import cache
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import google.api_core.exceptions as google_exceptions

from .services.ai_interviewer import start_new_interview, continue_interview

@api_view(['POST'])
def start_interview(request):
    # .strip() ഉപയോഗിച്ച് Whitespace Bypass തടയുന്നു
    cv_text = str(request.data.get('cv_text', '')).strip()
    jd_text = str(request.data.get('jd_text', '')).strip()
    interview_type = str(request.data.get('interview_type', '')).strip()

    # Strict Validation
    if not cv_text or not jd_text or not interview_type:
        return Response({"error": "CV, JD, and Interview Type are mandatory."}, status=status.HTTP_400_BAD_REQUEST)

    # Payload Length limits (DoS Prevention)
    if len(cv_text) > 5000 or len(jd_text) > 3000:
        return Response({"error": "Payload too large. Reduce CV or JD text size."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        ai_message, history = start_new_interview(cv_text, jd_text, interview_type)
        
        # സെക്യൂരിറ്റി: ഹിസ്റ്ററി ഡാറ്റ ഫ്രണ്ട്‌ എൻഡിലേക്ക് കൊടുക്കാതെ സെർവർ കാഷെയിൽ (Cache) സേവ് ചെയ്യുന്നു.
        session_id = str(uuid.uuid4())
        cache.set(session_id, history, timeout=3600) # 1 മണിക്കൂർ സമയത്തേക്ക് മാത്രം

        return Response({
            "session_id": session_id,
            "message": ai_message
        }, status=status.HTTP_200_OK)

    except google_exceptions.GoogleAPIError as e:
        # AI സ്പെസിഫിക് എറർ
        return Response({"error": "AI Service unavailable. Please try again."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        # Information Leakage തടയുന്നു (Generic error message)
        print(f"Server Error in start_interview: {str(e)}") # ടെർമിനലിൽ മാത്രം കാണാൻ
        return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def chat_interview(request):
    session_id = request.data.get('session_id', '').strip()
    user_message = str(request.data.get('message', '')).strip()
    
    # Type Casting Error തടയാൻ try-except ഉപയോഗിക്കുന്നു
    try:
        question_count = int(request.data.get('question_count', 1))
    except (ValueError, TypeError):
        return Response({"error": "Invalid question_count format."}, status=status.HTTP_400_BAD_REQUEST)

    if not session_id or not user_message:
        return Response({"error": "session_id and message are required."}, status=status.HTTP_400_BAD_REQUEST)

    if len(user_message) > 1000:
         return Response({"error": "Message too long."}, status=status.HTTP_400_BAD_REQUEST)

    # Cache-ൽ നിന്ന് ഹിസ്റ്ററി എടുക്കുന്നു
    history = cache.get(session_id)
    if not history:
        return Response({"error": "Interview session expired or invalid. Please start again."}, status=status.HTTP_404_NOT_FOUND)

    try:
        is_completed = False
        if question_count >= 5:
            is_completed = True
            
        ai_message, updated_history = continue_interview(history, user_message, is_final=is_completed)
        
        # പുതിയ ഹിസ്റ്ററി വീണ്ടും Cache-ൽ അപ്ഡേറ്റ് ചെയ്യുന്നു
        cache.set(session_id, updated_history, timeout=3600)

        return Response({
            "message": ai_message,
            "is_completed": is_completed
        }, status=status.HTTP_200_OK)

    except google_exceptions.GoogleAPIError as e:
        return Response({"error": "AI Service unavailable. Please try again."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        print(f"Server Error in chat_interview: {str(e)}")
        return Response({"error": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)