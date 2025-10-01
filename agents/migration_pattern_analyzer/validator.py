import pandas as pd
def check_required_columns(df):
        required_cols = ["location-long", "location-lat"]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            return missing
            
        else:
            return None

         