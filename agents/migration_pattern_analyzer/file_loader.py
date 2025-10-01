import pandas as pd
from validator import check_required_columns
def file_loader(file):
    df = pd.read_csv(file)
    msg = check_required_columns(df)
    if(msg is None):
        return df
    else:
        return msg
    