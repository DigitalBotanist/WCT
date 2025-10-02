import requests
import streamlit as st


SERPER_API_KEY = "76ab2b8db6dae9a1bfd4e4c13c63f22ff758c25d"
Gemini_key = "AIzaSyB9NyBi2RqzWNkRtFYoiw0Qi38ZLEPFH4A"

if not SERPER_API_KEY:
    raise ValueError("Please set the SERPER_API_KEY environment variable.")

SEARCH_URL = "https://google.serper.dev/search"


def search_animal_info(animal_name):
    
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    query = f"Conservation information about {animal_name}  " 
    payload = {"q": query}

    response = requests.post(SEARCH_URL, headers=headers, json=payload)
    response.raise_for_status()
    results = response.json()

    # snippets = []
    # for result in results.get("organic", []):
    #     if "snippet" in result:
    #         snippets.append(result["snippet"])

    snippets = [result["snippet"] for result in results.get("organic", [])  if "snippet" in result]

    if not snippets:
        return f"Sorry, I couldn't find detailed information about {animal_name}."

    combined_text = "".join(snippets)

    print(combined_text)
    return combined_text

def gemini_summarize(para):
    url=(
        "https://generativelanguage.googleapis.com/"
        f"v1beta/models/gemini-2.5-flash:generateContent?key={Gemini_key}"
    )
   
    prompt=f"Act like a professional Writer.\n Rewrite the following description filling the missing words, incomplete sentences in a clear, complete and readable way.Description: {para}. Categorize the description with sub topics - General details, Endangered levels, conservation status, Importance"
    body={
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2}
    }
    response=requests.post(url, json=body)
    response.raise_for_status()
    data = response.json()
      # Extract the generated text
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError):
        # Return empty string so caller can skip it
        return ""



# if __name__ == "__main__":
#     animal = input("Enter an animal name: ").strip()
#     info = search_animal_info(animal)
#     final = gemini_summarize(info)
#     print("\n=== Animal Conservation Summary ===\n")
#     print(final)

# st.title("Animal Threat and Conservation Levels")

# animal_name = st.text_input("Enter an animal name:")

# if st.button("Search"):
#     if animal_name:
#         with st.spinner("Searching..."):
#             summary = search_animal_info(animal_name)
#             info = gemini_summarize(summary)
#         st.success("Here’s what I found:")
#         st.write(info)
#     else:
#         st.warning("Please enter an animal name.")



        