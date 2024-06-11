import requests

# ChatGLM API 的 URL 和密钥
API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
API_KEY = "fa8169ddcea10641598540bf387bfc78.8L9Nr96gFTaR84ZQ"

def analyze_resume_text(text):
    data = {
        "model": "glm-4",
        "messages": [
            {"role": "system", "content": "You are a resume analyzer, your job is to help users with accurate, professional and insightful advices to optimize their resumes to get the jobs they want."},
            {"role": "user", "content": f"Analyze the following resume text and provide feedback:\n\n{text}"},
        ],
        "max_tokens": 500,
        "temperature": 0.7,
        "stop": ["stop_generating"]
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # 发送请求到 ChatGLM API
    response = requests.post(API_URL, headers=headers, json=data)
    print(response.json())
    analysis = response.json()["choices"][0]["message"]["content"].strip()
    return analysis