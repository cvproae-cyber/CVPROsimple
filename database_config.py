import os
import sqlalchemy

def get_connection():
    """
    Configures the connection based on the environment.
    Local: Connects via 127.0.0.1:9470 (Cloud SQL Proxy)
    Cloud Run: Connects via Unix Socket in /cloudsql/
    """
    db_user = os.environ.get("DB_USER", "postgres")
    db_pass = os.environ.get("DB_PASS") # Should be set in Cloud Run Secrets
    db_name = os.environ.get("DB_NAME", "cvpro_db")
    instance_connection_name = os.environ.get("INSTANCE_CONNECTION_NAME", "cvprosimple:me-west1:cvpro-postgres")

    # Check if we are running in Cloud Run (which defines K_SERVICE)
    if os.environ.get("K_SERVICE"):
        # Production: Connect via Unix Socket
        pool = sqlalchemy.create_engine(
            sqlalchemy.engine.url.URL.create(
                drivername="postgresql+pg8000",
                username=db_user,
                password=db_pass,
                database=db_name,
                query={"unix_sock": f"/cloudsql/{instance_connection_name}/.s.PGSQL.5432"},
            )
        )
    else:
        # Local Development: Connect via Cloud SQL Proxy on port 9470
        pool = sqlalchemy.create_engine(
            sqlalchemy.engine.url.URL.create(
                drivername="postgresql+pg8000",
                username=db_user,
                password=db_pass,
                host="127.0.0.1",
                port=9470,
                database=db_name,
            )
        )
    return pool