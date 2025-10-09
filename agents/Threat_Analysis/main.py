import json
import re
from typing import List, Dict
from datetime import datetime,timezone
import requests
import time
from dotenv import load_dotenv
import os


load_dotenv()

Gemini_key=os.getenv('GEMINI_API_KEY')
Serper_key = os.getenv("SERPER_API")

def search_serper(animal:str):
    url="https://google.serper.dev/search"
    headers = {"X-API-Key": Serper_key,"Accept":"application/json"} #Prove who are you
    query=f"Conservation information for {animal}"
    payload = {"q":query}
    responses = requests.request("POST", url, headers=headers, json=payload)
    return responses.json()

def search_population(animal:str):
    this_year = datetime.now(timezone.utc).year
    from_year= this_year-10
    url = "https://google.serper.dev/search"
    headers = {"X-API-Key": Serper_key, "Accept": "application/json"}
    query = f"Population {animal} for {this_year} to {from_year}"
    payload = {"q": query}
    responses = requests.request("POST", url, headers=headers, json=payload)
    return responses.json()


""""def call_llm(link):
    prompt=f"Summarize the details about threat'{link}' including population, reasons for endangered, solution for it"
    model=genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response"""""



def gemini_call(prompt:str, temperature:float=0.2)->str:
     gemini_url= (
            "https://generativelanguage.googleapis.com/"
            f"v1beta/models/gemini-2.5-flash:generateContent?key={Gemini_key}"
     )
     headers = {"content-type": "application/json"}
     body = {
         'contents':[{"role":"user","parts":[{"text":prompt}]}],
         "generation_config":{"temperature":temperature}
     }
     r= requests.post(gemini_url, headers=headers, json=body)
     if r.status_code>=400:
         try:
             err=r.json()
         except:
             err = {"raw": r.text}
         raise RuntimeError(f"Gemini {r.status_code}: {json.dumps(err, ensure_ascii=False)}")
     data=r.json()

     return data["candidates"][0]["content"]["parts"][0]["text"].strip()


def summerize_conservation(text:str,animal:str):
    prompt_text=(f"Summarize the following conservation info about '{animal}' "
                  f"Output format:\nPopulation:\n- ...\nReasons:\n- ...\nHow to protect them:\n- ..."
                  f"Text:\n{text}\n\n")

    return gemini_call(prompt_text, temperature=0.1)

def extract_threat_animal(snippets: List[str], animal: str)-> dict[str, str] | str | None:
    this_year = datetime.now(timezone.utc).year
    from_year= this_year-10
    joined ="\n\n".join(snippets)[:6000]
    prompt = (
        f"You are a strict data extractor. From the text below about {animal}, "
        f"return only valid JSON where each key is a year between {from_year} and {this_year}, "
        f"and each value is an integer representing the estimated number of {animal}s "
        f"that were considered endangered or threaded  in that year. "
        f"If a specific year is missing, use the closest previous year available "
        f"(e.g., if 2015 is missing, use 2014). "
        f"Do not invent numbers. "
        f"Return ONLY valid JSON with no extra text.\n\n"
        f"TEXT:\n{joined}"
    )

    raw=gemini_call(prompt, temperature=0.0)

    #Delte unwanted whitespaces
    raw=raw.strip()

    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.IGNORECASE)


    try:
        obj=json.loads(raw)  #Create object

    except json.decoder.JSONDecodeError:
        return {}

    series:Dict[str, str] = {}
    for k,v in obj.items():
        if re.fullmatch(r"\d{4}",str(k)):
            y=int(k)
            if from_year <= y <= this_year:
                try:
                    series[str(y)]=(str(v).replace(",","").strip())
                except Exception as e:
                    return f"error: {e}"

    return {str(y):series[str(y)] for y in sorted(map(int,series.keys()))}

def summerize_population(data:str,animal:str):
    
    prompt_text=(f"Analyze the following data about the {animal}'s threat distribution: {data}. "
                f"Identify how the thread data fluctuated over the years"
                f"(e.g., 2015 threat is low, But 2025 is it is high)"
                f"Summarize your findings in two to small description , clearly explaining how the threat changes over time. "
                f"Assume what are the reason if the {animal} is increased or decreased"
                f"Do not provide exact trend; describe the trend roughly instead.")

    return gemini_call(prompt_text, temperature=0.1)

def get_animal_detail(animal:str):

    search_details= search_serper(animal)
    item=[]
    for detail in search_details.get("organic",[]):
        snippet=detail.get("snippet")
        if not snippet:
            continue

        item.append(snippet)
    if not item:
            return f"❌ No info found for {animal}."
    text = "\n\n".join(item)
    return summerize_conservation(text,animal)

def get_animal_threat_details(animal:str):
    search_animal_population = search_population(animal)
    snippets:List[str] = []
    for hit in search_animal_population.get("organic",[]):
        s=hit.get("snippet",[])

        if s:
            snippets.append(s)

    if not search_animal_population.get("organic"):
        return f"Fail to find organic of {animal}."
    if not snippets:
        return f"Fail to find endangered of {animal}."
    try:
        series=extract_threat_animal(snippets,animal)
    except Exception as e:
        return f"error: {e}"
    print("Series:",series)
    return series

def get_animal_endangered_population(animal:str):
    endangered_animal=get_animal_threat_details(animal)

    print("ENdangerd animal: ",endangered_animal)

    if not isinstance(endangered_animal, dict) or endangered_animal is None:
        return endangered_animal if isinstance(endangered_animal, str) else f"❌ No info found for {animal}."

    item = []
    for year,value in endangered_animal.items():
       value=int(str(value).replace(",","").strip())
       print("Values : ",value)
       item.append(value)
    if not item:
        return f"❌ No info found for {animal}."
    text = "\n\n".join(str(i) for i in item)
    print("Items :" ,item)
    return summerize_population(text, animal)

def error_print():
    print("Error")
