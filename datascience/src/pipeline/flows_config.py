from docker.types import Mount
from dotenv import dotenv_values
from prefect.executors.dask import LocalDaskExecutor
from prefect.run_configs.docker import DockerRun
from prefect.schedules import CronSchedule, Schedule, clocks
from prefect.storage.local import Local

from config import (
    DOCKER_IMAGE,
    FLOWS_LOCATION,
    MONITORENV_VERSION,
    ROOT_DIRECTORY,
)
from src.pipeline.flows import (
    admin_areas,
    amp,
    control_objectives,
    facade_areas,
    fao_areas,
    historic_control_units,
    historic_controls,
    infractions,
    refresh_materialized_view,
    regulations,
    remove_broken_missions_resources_links,
    semaphores,
    update_departments_and_facades,
)

################################ Define flow schedules ################################
amp.flow.schedule = CronSchedule("22 0 * * *")

infractions.flow.schedule = CronSchedule("2 8,14 * * *")

refresh_materialized_view.flow.schedule = Schedule(
    clocks=[
        clocks.CronClock(
            "30 * * * *",
            parameter_defaults={
                "view_name": "analytics_actions",
            },
        ),
        clocks.CronClock(
            "35 12 * * *",
            parameter_defaults={
                "view_name": "analytics_surveillance_density_map",
            },
        ),
    ]
)

regulations.flow.schedule = CronSchedule("6,16,26,36,46,56 * * * *")

semaphores.flow.schedule = CronSchedule("3 5,15 * * *")

###################### List flows to register with prefect server #####################
flows_to_register = [
    admin_areas.flow,
    amp.flow,
    control_objectives.flow,
    facade_areas.flow,
    fao_areas.flow,
    historic_controls.flow,
    historic_control_units.flow,
    infractions.flow,
    refresh_materialized_view.flow,
    regulations.flow,
    remove_broken_missions_resources_links.flow,
    semaphores.flow,
    update_departments_and_facades.flow,
]

################################ Define flows' executor ###############################
for flow in flows_to_register:
    flow.executor = LocalDaskExecutor()

################################ Define flows' storage ################################
# This defines where the executor can find the flow.py file for each flow **inside**
# the container.
for flow in flows_to_register:
    flow.storage = Local(
        add_default_labels=False,
        stored_as_script=True,
        path=(FLOWS_LOCATION / flow.file_name).as_posix(),
    )

################### Define flows' run config ####################
for flow in flows_to_register:
    host_config = None

    if flow.name in (
        "Control objectives",
        "Control resources, bases and contacts",
    ):
        host_config = {
            "mounts": [
                Mount(
                    target="/home/monitorenv-pipeline/datascience/src/pipeline/data",
                    source="/opt/data",
                    type="bind",
                )
            ],
        }

    flow.run_config = DockerRun(
        image=f"{DOCKER_IMAGE}:{MONITORENV_VERSION}",
        host_config=host_config,
        env=dotenv_values(ROOT_DIRECTORY / ".env"),
        labels=["monitorenv"],
    )
