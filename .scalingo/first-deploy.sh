#!/bin/bash

echo "First deploy"

export PATH=$HOME/bin:$PATH
dbclient-fetcher psql 14
psql --dbname $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS "pg_trgm";"

yarn migration