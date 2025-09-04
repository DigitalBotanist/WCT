import pandas as pd
from sklearn.cluster import KMeans

def getClusters():
    def check_required_columns(df):
        required_cols = ["location-long", "location-lat"]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            print("❌ Missing columns:", missing)
        else:
            print("✅ All required columns are present.")

    df = pd.read_csv("migration_original.csv")
    check_required_columns(df)

    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(['individual-local-identifier', 'timestamp'])

    # Clustering
    animal_clusters = {}
    for animal_id, group in df.groupby('individual-local-identifier'):
        coords = group[['location-long', 'location-lat']].to_numpy()
        if len(coords) < 2:
            continue

        k = min(2, len(coords))
        kmeans = KMeans(n_clusters=k, random_state=42)
        labels = kmeans.fit_predict(coords)

        df.loc[group.index, 'movement_cluster'] = labels
        cluster_counts = pd.Series(labels).value_counts()
        resting_cluster = cluster_counts.idxmax()

        df.loc[group.index, 'movement_label'] = ['resting' if x == resting_cluster else 'stopover' for x in labels]
        animal_clusters[animal_id] = df.loc[group.index]

    # Separate resting and stopover
    resting = df[df['movement_label'] == 'resting'].copy()
    stopover = df[df['movement_label'] == 'stopover'].copy()

    resting['year'] = resting['timestamp'].dt.year
    stopover['year'] = stopover['timestamp'].dt.year

    # Group by year
    resting_grouped = resting.groupby('year').agg({
        'location-long': list,
        'location-lat': list
    }).reset_index()

    stopover_grouped = stopover.groupby('year').agg({
        'location-long': list,
        'location-lat': list
    }).reset_index()

    #del this cuz thiis sends only 5 records per year

    # Limit to 5 coordinates per year
    resting_grouped['location-long'] = resting_grouped['location-long'].apply(lambda x: x[:100])
    resting_grouped['location-lat'] = resting_grouped['location-lat'].apply(lambda x: x[:100])

    stopover_grouped['location-long'] = stopover_grouped['location-long'].apply(lambda x: x[:100])
    stopover_grouped['location-lat'] = stopover_grouped['location-lat'].apply(lambda x: x[:100])

    # Convert numpy types in DataFrames to Python types
    def convert_df(df):
        for col in df.columns:
            if pd.api.types.is_integer_dtype(df[col]):
                df[col] = df[col].astype(int)
            elif pd.api.types.is_float_dtype(df[col]):
                df[col] = df[col].astype(float)
        return df
    
    #converting types for fastapi
    resting_grouped = convert_df(resting_grouped)
    stopover_grouped = convert_df(stopover_grouped)

    # Convert numpy types
    resting_grouped = resting_grouped.astype({'year': int})
    stopover_grouped = stopover_grouped.astype({'year': int})

    # Convert to JSON-friendly dict
    resting_data = resting_grouped.to_dict(orient="records")
    stopover_data = stopover_grouped.to_dict(orient="records")


    return {"resting": resting_data, "stopover": stopover_data}



   


