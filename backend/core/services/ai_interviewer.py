import google.generativeai as genai
from django.conf import settings

# Configure API Key
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

def start_new_interview(cv_text, jd_text, interview_type):
    """
    പുതിയ ഇന്റർവ്യൂ തുടങ്ങാനും, ആദ്യത്തെ ഹിസ്റ്ററി ഉണ്ടാക്കാനും.
    """
    prompt = f"""
    You are a strict, professional Senior Technical Interviewer. 
    You are conducting a '{interview_type}' round for a candidate.
    
    Candidate's CV: {cv_text}
    Job Description (JD): {jd_text}
    
    RULES:
    1. DO NOT break character. Act entirely as the interviewer.
    2. Ask ONLY ONE question at a time. Wait for the candidate's response.
    3. Keep your questions highly relevant to the JD and the candidate's CV.
    4. Do not provide the answers. 
    5. Keep the conversation short and to the point.
    
    Start the interview now by greeting the candidate and asking the first question based on their CV and the JD.
    """
    
    chat = model.start_chat(history=[])
    response = chat.send_message(prompt)
    
    # Internal history format to save in Cache
    new_history = [
        {"role": "user", "parts": [prompt]},
        {"role": "model", "parts": [response.text]}
    ]
    return response.text, new_history


def continue_interview(history_list, user_message, is_final=False):
    """
    നിലവിലെ ചാറ്റ് തുടരാനും, അവസാനം റിപ്പോർട്ട് ചോദിക്കാനും.
    """
    chat = model.start_chat(history=history_list)
    
    if is_final:
        final_prompt = f"""
        The candidate answered: '{user_message}'. 
        The interview is now over. Do not ask any more questions. 
        Provide a strict performance report card.
        You MUST return ONLY a raw JSON object string. Do NOT include markdown code blocks like ```json ... ```.
        Strictly adhere to this format:
        {{
            "score_out_of_100": number,
            "core_strengths": ["list", "of", "strengths"],
            "critical_weaknesses": ["list", "of", "weaknesses"],
            "overall_feedback": "Detailed paragraph feedback."
        }}
        """
        response = chat.send_message(final_prompt)
        user_part = final_prompt
    else:
        response = chat.send_message(user_message)
        user_part = user_message

    updated_history = history_list + [
        {"role": "user", "parts": [user_part]},
        {"role": "model", "parts": [response.text]}
    ]
    
    return response.text, updated_history