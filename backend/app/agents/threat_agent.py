from datetime import datetime, timezone
from typing import List, Dict
import requests
import json
import logging
import re

from app.models.agent import Agent
from app.models.graph import Result

class ThreatAgent(Agent):
    def __init__(self, serper_key, gemini_key):
        super().__init__(name="ThreatAgent", expertise="handle threat analyze")
        self.serper_key = serper_key
        self.gemini_key = gemini_key

    async def process(self, task, history = None):
        # animal_name = task.get("name")
        # print("animal name", animal_name)
        # details = self._get_animal_detail(animal_name)
        # population = self._get_animal_threat_details(animal_name)
        # print(population)
        # result = Result(success=True, content=(details), data=population)        
        # return result
        try:
            # Extract animal name from task
            animal_name = task.get("name")
            if not animal_name:
                raise ValueError("Animal name is missing in the task.")
            
            logging.debug(f"Threat Animal name: {animal_name}")
            
            # Get animal details
            details = self._get_animal_detail(animal_name)
            if not details:
                raise ValueError(f"No details found for animal: {animal_name}")

            # Get population and threat details
            population = self._get_animal_threat_details(animal_name)
            if not population:
                raise ValueError(f"No threat data found for animal: {animal_name}")

            # Return result if everything is successful
            result = Result(success=True, content=details, data=population)
            return result

        except ValueError as ve:
            logging.error(f"Value Error: {ve}")
            # Handle specific error, like missing name or missing details
            return Result(success=False, content=str(ve), data=None)
        
        except Exception as e:
            logging.error(f"Unexpected Error: {e}")
            # Catch other unexpected errors and log them
            return Result(success=False, content="An unexpected error occurred", data=None)
    

    def _search_serper(self, animal:str):
        url="https://google.serper.dev/search"
        headers = {"X-API-Key": self.serper_key,"Accept":"application/json"} #Prove who are you
        query=f"Conservation information for {animal}"
        payload = {"q":query}
        responses = requests.request("POST", url, headers=headers, json=payload)
        return responses.json()
        
    def _search_population(self, animal:str):
        this_year = datetime.now(timezone.utc).year
        from_year= this_year-10
        url = "https://google.serper.dev/search"
        headers = {"X-API-Key": self.serper_key, "Accept": "application/json"}
        query = f"Population {animal} for {this_year} to {from_year}"
        payload = {"q": query}
        responses = requests.request("POST", url, headers=headers, json=payload)
        return responses.json()


    def _get_animal_detail(self, animal:str):
        """
        threat details summary 
        population ? 
        reason? 
        how to protect ? 
        """
        search_details= self._search_serper(animal)
        item=[]
        for detail in search_details.get("organic",[]):
            snippet=detail.get("snippet")
            if not snippet:
                continue

            item.append(snippet)
        if not item:
                return f"❌ No info found for {animal}."
        text = "\n\n".join(item)
        return self._summerize_conservation(text,animal)

    def _get_animal_threat_details(self, animal:str):
        """
        return no of endanged 
        """
        search_animal_population = self._search_population(animal)
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
            series=self._extract_threat_animal(snippets,animal)
        except Exception as e:
            return f"error: {e}"
        print("Series:",series)
        return series

    def _gemini_call(self, prompt:str, temperature:float=0.2)->str:
        gemini_url= (
                "https://generativelanguage.googleapis.com/"
                f"v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_key}"
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

    def _summerize_conservation(self, text:str,animal:str):
        prompt_text=(f"Summarize the following conservation info about '{animal}' "
                    f"Output format:\nPopulation:\n- ...\nReasons:\n- ...\nHow to protect them:\n- ..."
                    f"Text:\n{text}\n\n")

        return self._gemini_call(prompt_text, temperature=0.1)

    def _extract_threat_animal(self, snippets: List[str], animal: str)-> dict[str, str] | str | None:
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

        raw= self._gemini_call(prompt, temperature=0.0)

        #Delte unwanted whitespaces
        raw=raw.strip()

        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.IGNORECASE)


        print(raw)

        try:
            obj=json.loads(raw)  #Create object

        except json.decoder.JSONDecodeError:
            return {}

        data = []
        for k,v in obj.items():
            if re.fullmatch(r"\d{4}",str(k)):
                y=int(k)
                if from_year <= y <= this_year:
                    try:
                        data.append({'year': int(y), 'population' : int(str(v).replace(",","").strip())})
                    except Exception as e:
                        return f"error: {e}"

        return data