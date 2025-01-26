import duckdb

con = duckdb.connect("db.duckdb")

con.sql("SELECT * FROM buses").show()


con = duckdb.connect()
con.sql("SELECT * FROM information_schema.tables").show()
con.sql("select * from duckdb_settings()").show()
con.sql("select * from buses").show()
