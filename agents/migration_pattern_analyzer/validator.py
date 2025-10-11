import pandas as pd
def check_required_columns(df):
        required_cols = [
    ("location-long", "location-lat"),
    ("long", "lat"),
    ("longitude", "latitude"),
    ("lng", "latd"),
    ("lon", "lat_deg"),
    ("coord_x", "coord_y"),
    ("x_coord", "y_coord"),
    ("long_deg", "lat_deg"),
    ("geo_long", "geo_lat"),
    ("gps_long", "gps_lat"),
    ("longitude_deg", "latitude_deg"),
    ("longitud", "latitud"),        # Spanish
    ("lng_deg", "lat_deg"),
    ("longt", "latt"),              # some datasets
    ("easting", "northing"),        # UTM coordinates
    ("x", "y"),                      # generic
    ("map_long", "map_lat"),
    ("loc_long", "loc_lat"),
    ("position_long", "position_lat")
    ]

        
        for long_col, lat_col in required_cols:
            if long_col in df.columns and lat_col in df.columns:
                return None

            return "Doesn't have valid colomns"

         