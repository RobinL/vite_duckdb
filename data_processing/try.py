import duckdb
import pandas as pd
import numpy as np

# Create some sample data
np.random.seed(42)  # For reproducibility

# Generate 20 rows of sample data
data = {
    "bus_number": [f"{np.random.randint(1, 999):03d}" for _ in range(20)],
    "company": np.random.choice(
        ["First Bus", "Stagecoach", "Arriva", "Go-Ahead", "National Express"], 20
    ),
    "region": np.random.choice(
        ["London", "South East", "North West", "Scotland", "Wales", "South West"], 20
    ),
    "lat_min": np.random.uniform(50.0, 58.0, 20),
    "lat_max": [],  # Will fill this after ensuring it's greater than lat_min
    "lng_min": np.random.uniform(-5.0, 1.0, 20),
    "lng_max": [],  # Will fill this after ensuring it's greater than lng_min
}

# Ensure max values are greater than min values
for i in range(20):
    data["lat_max"].append(data["lat_min"][i] + np.random.uniform(0.1, 0.5))
    data["lng_max"].append(data["lng_min"][i] + np.random.uniform(0.1, 0.5))

# Create DataFrame
df = pd.DataFrame(data)

# Create DuckDB database and table
con = duckdb.connect("db.duckdb")
con.execute("""
    CREATE TABLE buses (
        bus_number VARCHAR,
        company VARCHAR,
        region VARCHAR,
        lat_min DOUBLE,
        lat_max DOUBLE,
        lng_min DOUBLE,
        lng_max DOUBLE
    )
""")

# Insert the data
con.execute("INSERT INTO buses SELECT * FROM df")

# Verify the data
result = con.execute("SELECT * FROM buses").fetchall()
print("Sample of created data:")
print(con.execute("SELECT * FROM buses LIMIT 5").df())

con.close()
