echo "Dump Database"
pg_dump --host=localhost --port=5432 --username=dbadmin --dbname=manager_contest--file=database_dumps/manager_contest.sql -v -Fc