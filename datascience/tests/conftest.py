import itertools
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from time import sleep
from typing import List

import docker
import pytest
from dotenv import dotenv_values
from pytest import MonkeyPatch

from config import ROOT_DIRECTORY, TEST_DATA_LOCATION
from src.db_config import create_engine

migrations_folders = [
    ROOT_DIRECTORY
    / Path("../backend/src/main/resources/db/migration/internal").resolve(),
    ROOT_DIRECTORY
    / Path("../backend/src/main/resources/db/migration/layers").resolve(),
]

# Bind mounts of migrations scripts inside test database container
migrations_mounts_root = "/opt/migrations"

migrations_folders_mounts = [
    (
        f"{str(migrations_folder)}:"
        f"{migrations_mounts_root}/{migrations_folder.name}"
    )
    for migrations_folder in migrations_folders
]

test_data_scripts_folder = TEST_DATA_LOCATION / Path("remote_database")

################################## Handle migrations ##################################


@dataclass
class Migration:
    path: Path
    major: int
    minor: int
    script: str = field(init=False)

    def __post_init__(self):
        self.script = read_sql_file(self.path)


def read_sql_file(script_path: Path) -> str:
    cmd_lines = []
    with open(script_path, "r") as f:
        for line in f:
            if not line.startswith("--"):
                cmd_lines.append(line)

    return "".join(cmd_lines)


def sort_migrations(migrations: List[Migration]) -> List[Migration]:
    return sorted(migrations, key=lambda m: (m.major, m.minor))


def get_migrations_in_folder(folder: Path) -> List[Migration]:
    files = os.listdir(folder)
    migration_regex = re.compile(r"V(?P<major>\d+)\.(?P<minor>\d+)__(?P<name>.*)\.sql")
    migrations = []

    for file in files:
        match = migration_regex.match(file)
        if match:
            major = int(match.group("major"))
            minor = int(match.group("minor"))
            path = (folder / Path(file)).resolve()
            migrations.append(Migration(path=path, major=major, minor=minor))

    return sort_migrations(migrations)


def get_migrations_in_folders(migrations_folders: List[Path]) -> List[Migration]:
    migrations = itertools.chain(
        *[get_migrations_in_folder(f) for f in migrations_folders]
    )
    migrations = sort_migrations(migrations)
    return migrations


################################# Start test database #################################
@pytest.fixture(scope="session")
def monkeysession(request):
    mpatch = MonkeyPatch()
    yield mpatch
    mpatch.undo()


@pytest.fixture(scope="session", autouse=True)
def set_environment_variables(monkeysession):
    for k, v in dotenv_values(ROOT_DIRECTORY / ".env.test").items():
        monkeysession.setenv(k, v)


@pytest.fixture(scope="session")
def create_docker_client(set_environment_variables):
    client = docker.from_env()
    yield client


@pytest.fixture(scope="session")
def start_remote_database_container(set_environment_variables, create_docker_client):
    client = create_docker_client
    print("Starting database container")
    remote_database_container = client.containers.run(
        "timescale/timescaledb-postgis:1.7.4-pg11",
        environment={
            "POSTGRES_PASSWORD": os.environ["MONITORENV_REMOTE_DB_PWD"],
            "POSTGRES_USER": os.environ["MONITORENV_REMOTE_DB_USER"],
            "POSTGRES_DB": os.environ["MONITORENV_REMOTE_DB_NAME"],
        },
        ports={"5432/tcp": 5434},
        detach=True,
        volumes=migrations_folders_mounts,
    )
    sleep(3)
    print(remote_database_container.attrs["Mounts"])
    yield remote_database_container
    print("Stopping database container")
    remote_database_container.stop()
    remote_database_container.remove(v=True)


@pytest.fixture(scope="session")
def create_tables(set_environment_variables, start_remote_database_container):
    container = start_remote_database_container
    migrations = get_migrations_in_folders(migrations_folders)

    print("Creating tables")
    for m in migrations:

        print(f"{m.major}.{m.minor}: {m.path.name}")

        # Script filepath inside database container
        script_filepath = f"{migrations_mounts_root}/{m.path.parent.name}/{m.path.name}"

        # Use psql inside database container to run migration scripts.
        # Using sqlalchemy / psycopg2 to run migration scripts from python is not
        # possible due to the use of `COPY FROM STDIN` in some migrations.
        res = container.exec_run(
            (
                "psql "
                f"-U {os.environ['MONITORENV_REMOTE_DB_USER']} "
                f"-d {os.environ['MONITORENV_REMOTE_DB_NAME']} "
                f"-f {script_filepath}")
        )
        print(res.output.decode())

    res = container.exec_run(
        (
            "psql "
            f"-U {os.environ['MONITORENV_REMOTE_DB_USER']} "
            f"-d {os.environ['MONITORENV_REMOTE_DB_NAME']} "
            f"-c \"SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public'\";"
        )
    )
    print(res.output.decode())


@pytest.fixture()
def reset_test_data(create_tables):
    e = create_engine("monitorenv_remote")
    test_data_scripts = get_migrations_in_folder(test_data_scripts_folder)
    print("Inserting test data")
    for s in test_data_scripts:
        print(f"{s.major}.{s.minor}: {s.path.name}")
        e.execute(s.script)
