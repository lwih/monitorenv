

INSERT INTO infractions_observations_reports (
    id,
    source_type ,
    semaphore_id ,
    control_unit_id ,
    source_name ,
    target_type ,
    vehicle_type,
    target_details,
    geom,
    description,
    report_type,
    theme,
    sub_themes,
    action_taken,
    is_infraction_proven,
    is_control_required,
    is_unit_available,
    created_at,
    validity_time,
    is_deleted) VALUES (
    1,
    'SEMAPHORE',
    21,
    null,
    'SEMAPHORE 21',
    'VEHICLE',
    'VESSEL',
    '{"vesselName": "Vessel 1", "mmsi": "012314231343" }',
    ST_GeomFromText('POINT(-8.6109 41.1459)', 4326),
    'Description 1',
    'INFRACTION',
    'THEME',
    '{"subtheme1", "subtheme2"}',
    'ACTION TAKEN',
    true,
    true,
    true,
    now() - INTERVAL '3 days',
    24,
    false
);


INSERT INTO infractions_observations_reports (
    id,
    source_type ,
    semaphore_id ,
    control_unit_id ,
    source_name ,
    target_type ,
    vehicle_type,
    target_details,
    geom,
    description,
    report_type,
    theme,
    sub_themes,
    action_taken,
    is_infraction_proven,
    is_control_required,
    is_unit_available,
    created_at,
    validity_time,
    is_deleted) VALUES (
    2,
    'SEMAPHORE',
    23,
    null,
    'SEMAPHORE 23',
    'VEHICLE',
    'VESSEL',
    '{"vesselName": "Vessel 2", "mmsi": "012314231344" }',
    ST_GeomFromText('POINT(-8.6109 41.1859)', 4326),
    'Description 2',
    'INFRACTION',
    'THEME',
    '{"subtheme1", "subtheme2"}',
    'ACTION TAKEN',
    true,
    true,
    true,
    now() - INTERVAL '2 days',
    2,
    false
);


INSERT INTO infractions_observations_reports (
    id,
    source_type ,
    semaphore_id ,
    control_unit_id ,
    source_name ,
    target_type ,
    vehicle_type,
    target_details,
    geom,
    description,
    report_type,
    theme,
    sub_themes,
    action_taken,
    is_infraction_proven,
    is_control_required,
    is_unit_available,
    created_at,
    validity_time,
    is_deleted) VALUES (
    3,
    'CONTROL_UNIT',
    null,
    null,
    'CONTROL UNIT 1',
    'VEHICLE',
    'VESSEL',
    '{"vesselName": "Vessel 3", "mmsi": "012314231345" }',
    ST_GeomFromText('POINT(-8.7109 41.1459)', 4326),
    'Description 3',
    'INFRACTION',
    'THEME',
    '{"subtheme1", "subtheme2"}',
    'ACTION TAKEN',
    true,
    true,
    true,
    now() - INTERVAL '1 hour',
    12,
    false
);
